import { assign, some, pick, values, pickBy, cloneDeep, isObject, toNumber } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
    toPatchObject as toPatchConfigObject,
} from '../base/config';
// import {
//     toObjectArray,
//     KVtoObject,
// } from '../base/utils';
import { getFromModel } from '../base/utils';

const channels = [
    'wechatConfigs',
    'webhookConfigs',
    'emailConfigs',
];

export const CONFIGS = {
    wechatConfigs: {
        toUser: '',
        toParty: '',
        toTag: '',
        sendResolved: false,
        advanced: false,
        advancedPart: {
            apiURL: '',
            corpID: '',
            agentID: '',
            apiSecret: {
                key: '',
                name: '',
            },
        },
    },
    webhookConfigs: {
        sendResolved: false,
        url: '',
        // urlSecret: {
        //     name: '',
        //     key: '',
        //     optional: false,
        // },
        // httpConfig: {
        //     proxyURL: ''.
        // },
        maxAlerts: 0,

    },
    emailConfigs: {
        sendResolved: false,
        to: '',
        advanced: false,
        advancedPart: {
            from: '',
            // hello: '',
            smarthost: '',
            authUsername: '',
            authPassword: '',
            authSecret: {
                key: '',
                name: '',
            },
        },
        // authIdentity: '',
        // text: '',
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
                // Object.assign({}, cloneDeep(CONFIGS[channel]), c);
                const baseConfig = cloneDeep(CONFIGS[channel]);
                if (channel === 'wechatConfigs') {
                    Object.keys(baseConfig.advancedPart).forEach(k => {
                        if (c[k]) {
                            baseConfig.advancedPart[k] = c[k];
                            baseConfig.advanced = true;
                        }
                    });
                    Object.assign(baseConfig, pick(c, [ 'toUser', 'toParty', 'toTag', 'sendResolved' ]));
                }

                if (channel === 'webhookConfigs') {
                    Object.assign(baseConfig, pick(c, [ 'sendResolved', 'url', 'maxAlerts' ]));
                }

                if (channel === 'emailConfigs') {
                    Object.keys(baseConfig.advancedPart).forEach(k => {
                        if (c[k]) {
                            baseConfig.advancedPart[k] = c[k];
                            baseConfig.advanced = true;
                        }
                    });
                    Object.assign(baseConfig, pick(c, [ 'to', 'sendResolved' ]));
                }
                return baseConfig;
            });
        }
    });
    return obj;
}

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        spec: {
            route: {
                receiver: g('spec.route.receiver'),
            },
            receivers: resolveReceiver(g('spec.receivers[0]') || {}),
        },
    };
}

function refactReceiver(receivers, name) {
    const obj = {
        name,
    };
    receivers.forEach(r => {
        if (r.enable) {
            const channel = r.receiver;
            obj[channel] = r.config.filter(c => {
                if (channel === 'wechatConfigs') {
                    return some(values(pick(c, [ 'toUser', 'toParty', 'toTag' ])));
                }
                if (channel === 'webhookConfigs') {
                    return some(values(pick(c, [ 'url', 'maxAlerts' ])));
                }
                if (channel === 'emailConfigs') {
                    return some(values(pick(c, [ 'to' ])));
                }
                return false;
            }).map(c => {
                const yaml = {};
                if (channel === 'wechatConfigs') {
                    assign(yaml, pick(c, [ 'toUser', 'toParty', 'toTag', 'sendResolved' ]));
                    if (c.advanced) {
                        assign(yaml, pickBy(c.advancedPart, v => (isObject(v) ? (v.key && v.name) : Boolean(v))));
                    }
                }
                if (channel === 'webhookConfigs') {
                    assign(yaml, pick(c, [ 'sendResolved', 'url', 'maxAlerts' ]));
                    yaml.maxAlerts = toNumber(yaml.maxAlerts);

                }
                if (channel === 'emailConfigs') {
                    assign(yaml, pick(c, [ 'to', 'sendResolved' ]));
                    if (c.advanced) {
                        assign(yaml, pickBy(c.advancedPart, v => (isObject(v) ? (v.key && v.name) : Boolean(v))));
                    }
                }
                return yaml;
            });
        }
    });
    return obj;
}

export function toK8SObject(model, tenant, project) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'monitoring.coreos.com/v1alpha1',
        'AlertmanagerConfig',
        model
    );
    const spec = {
        route: {
            receiver: g('metadata.name'),
            matchers: [{
                name: 'kubecube_io_owner',
                value: `${tenant}-${project}-${g('metadata.name')}`,
            }],
        },
        receivers: [ refactReceiver(g('spec.receivers'), g('metadata.name')) ],
    };
    obj.metadata.labels['kubecube.io/owner'] = `${tenant}-${project}-${g('metadata.name')}`;

    return {
        ...obj,
        spec,
    };
}

export function patchK8SObject(model, tenant, project) {
    const obj = toPatchConfigObject(model);
    const newK8SObject = toK8SObject(model, tenant, project);
    return {
        ...obj,
        spec: {
            receivers: newK8SObject.spec.receivers,
        },
    };
}
