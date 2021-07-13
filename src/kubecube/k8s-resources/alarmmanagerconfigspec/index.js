import { pickBy } from 'lodash';
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
        // apiSecret: {
        //     name: '',
        //     key: '',
        //     optional: false,
        // },
        sendResolved: false,
        apiURL: '',
        corpID: '',
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
        maxAlerts: '',

    },
    emailConfigs: {
        sendResolved: false,
        to: '',
        // from: '',
        // hello: '',
        // smarthost: '',
        // authUsername: '',
        // authPassword: '',
        // authSecret: '',
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
            cur.config = receiver[channel].map(c => Object.assign({}, CONFIGS[channel], c));
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
            obj[r.receiver] = r.config
                .filter(c => Object.values(c).some(p => p))
                .map(c => {
                    const obj = pickBy(c, i => i);
                    if (obj.maxAlerts) {
                        obj.maxAlerts = +obj.maxAlerts;
                    }
                    return obj;
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
