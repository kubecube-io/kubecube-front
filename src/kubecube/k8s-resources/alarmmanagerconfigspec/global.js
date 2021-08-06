import { assign, some, pick, pickBy, omit, values, toNumber, merge, cloneDeep, get } from 'lodash';
import {
    toPlainObject as toSecretPlainObject,
    toK8SObject as toSecretK8SObject,
} from 'kubecube/k8s-resources/secret';
import yamljs from 'yamljs';

export const DEFAULT_CONFIG = {
    global: {
        resolve_timeout: '',
        smtp_smarthost: '',
        smtp_from: '',
        smtp_auth_username: '',
        smtp_auth_password: '',
        wechat_api_url: '',
        wechat_api_secret: '',
        wechat_api_corp_id: '',
    },
    route: {
        receiver: '',
        group_by: [],
        group_wait: '30s',
        group_interval: '30s',
        repeat_interval: '4h',
        matchers: [],

    },
    receivers: [],
    templates: [],
};

const channels = [
    'wechatConfigs',
    'webhookConfigs',
    'emailConfigs',
];

export const operators = ['=', '!=', '=~', '!~'];

export const MANGER_CONFIGS = {
    wechatConfigs: {
        to_user: '',
        to_party: '',
        to_tag: '',
        send_resolved: false,
    },
    webhookConfigs: {
        send_resolved: false,
        url: '',
        max_alerts: 0,

    },
    emailConfigs: {
        send_resolved: false,
        to: '',
    },
};

function resolveReceiver(receiver) {
    const obj = [
        {
            receiver: 'wechatConfigs',
            enable: false,
            config: [],
        },
        {
            receiver: 'webhookConfigs',
            enable: false,
            config: [],
        },
        {
            receiver: 'emailConfigs',
            enable: false,
            config: [],
        },
    ];
    channels.forEach((channel, i) => {
        if (receiver[channel] && receiver[channel].length > 0) {
            const cur = obj[i];
            cur.enable = true;

            cur.config = receiver[channel].map(c => {
                const baseConfig = cloneDeep(MANGER_CONFIGS[channel]);
                return merge(baseConfig, c);
            });
        }
    });
    return obj;
}

function resolveReceivers(receivers) {
    return receivers.map(r => ({
        name: r.name,
        receivers: resolveReceiver(r),
    }));
}

export function getDefaultReceiver() {
    return {
        name: '',
        receivers: resolveReceiver({}),
    };
}

function resolveConfig(config) {
    const wrappedConfig = merge(cloneDeep(DEFAULT_CONFIG), config);
    wrappedConfig.global.smtp_auth_password_curr = wrappedConfig.global.smtp_auth_password;
    wrappedConfig.global.smtp_auth_password = wrappedConfig.global.smtp_auth_password_curr ? '<secret>' : '';
    wrappedConfig.global.wechat_api_secret_curr = wrappedConfig.global.wechat_api_secret;
    wrappedConfig.global.wechat_api_secret = wrappedConfig.global.wechat_api_secret_curr ? '<secret>' : '';
    return {
        ...wrappedConfig,
        receivers: resolveReceivers((get(config, 'receivers') || []).filter(c => c)),
        source: config,
    };
}

export function toPlainObject(model) {
    const secret = toSecretPlainObject(model);
    const yaml = secret.data.find(d => d.key === 'alertmanager.yaml');
    let configure;
    if (yaml) {
        configure = resolveConfig(yamljs.parse(yaml.value));
    } else {
        configure = resolveConfig({});
    }

    return {
        ...secret,
        configure,
    };
}

export function refactReceiver(c) {
    const { receivers, name } = c;
    const obj = {
        name,
    };
    receivers.forEach(r => {
        if (r.enable) {
            const channel = r.receiver;
            obj[channel] = r.config.filter(c => {
                if (channel === 'wechatConfigs') {
                    return some(values(pick(c, [ 'to_user', 'to_party', 'to_tag' ])));
                }
                if (channel === 'webhookConfigs') {
                    return some(values(pick(c, [ 'url', 'max_alerts' ])));
                }
                if (channel === 'emailConfigs') {
                    return some(values(pick(c, [ 'to' ])));
                }
                return false;
            }).map(c => {
                const yaml = {};
                if (channel === 'wechatConfigs') {
                    assign(yaml, pick(c, [ 'to_user', 'to_party', 'to_tag', 'send_resolved' ]));
                }
                if (channel === 'webhookConfigs') {
                    assign(yaml, pick(c, [ 'send_resolved', 'url', 'max_alerts' ]));
                    yaml.maxAlerts = toNumber(yaml.max_alerts);

                }
                if (channel === 'emailConfigs') {
                    assign(yaml, pick(c, [ 'to', 'sendResolved' ]));
                }
                return yaml;
            });
        }
    });
    return obj;
}


function refactConfig(config) {
    const source = config;
    const global = omit(config.global, [ 'smtp_auth_password_curr', 'wechat_api_secret_curr' ]);
    global.smtp_auth_password = global.smtp_auth_password === '<secret>' ? config.global.smtp_auth_password_curr : global.smtp_auth_password;
    global.wechat_api_secret = global.wechat_api_secret === '<secret>' ? config.global.wechat_api_secret_curr : global.wechat_api_secret;

    return {
        global: pickBy(global, d => (typeof d === 'string' ? !!d : true)),
        route: config.route,
        receivers: config.receivers.map(c => refactReceiver(c)),
        ...pick(source, [ 'templates', 'inhibit_rules', 'mute_time_intervals' ]),
    };
}

export function toK8SObject(model) {
    const configure = refactConfig(model.configure);
    const yaml = model.data.find(d => d.key === 'alertmanager.yaml');
    if (yaml) {
        yaml.value = yamljs.stringify(configure);
    } else {
        model.data.push({
            key: 'alertmanager.yaml',
            value: yamljs.stringify(configure),
        });
    }
    model.metadata.name = 'alertmanager-kubecube-monitoring-alertmanager';
    return toSecretK8SObject(model);
}

export function patchK8SObject(model) {
    const secret = toK8SObject(model);
    return {
        data: secret.data,
    };
}
