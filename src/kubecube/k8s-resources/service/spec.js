import { pickBy, isObjectLike, zipObjectDeep, toNumber, omit } from 'lodash';
import { getFromModel, toObjectArray, KVtoObject } from '../base/utils';
import {
    SERVICE_LOAD_BALANCER_IP_TYPE_MAP,
} from 'kubecube/utils/constance';

export const toPlainObject = model => {
    const g = getFromModel(model);
    const name = g('metadata.name');
    const namespace = g('metadata.namespace');
    const ports = (g('spec.ports') || []).map(p => ({
        ...p,
        text: `${name}.${namespace}:${p.port}`,
    }));
    const annotations = g('metadata.annotations', {});
    const ipType = annotations['nlb.netease.com/lb-network']
        || annotations['netease.com/lb-network']
        || annotations['netease.com_loadbalancer_network'];
    const ipTypeText = (SERVICE_LOAD_BALANCER_IP_TYPE_MAP[ipType] || {}).text || '-';
    const bandWidth = annotations['nlb.netease.com/lb-bandwidth']
        || annotations['netease.com/lb-bandwidth']
        || annotations[`netease.com_loadbalancer_${ipType}_bandwidth`]
        || annotations['netease.com_loadbalancer_bandwidth']
        || '-';

    const type = g('spec.type');
    const clusterIP = g('spec.clusterIP');
    const selector = toObjectArray(g('spec.selector', {}), 'key', 'value');
    let template;
    if (type === 'NodePort') {
        template = 'nodePort';
    } else if (type === 'LoadBalancer') {
        template = 'loadBalancer';
    } else if (clusterIP === 'None') {
        template = 'headless';
    } else if (selector.length) {
        template = 'normal';
    } else {
        template = 'external';
    }
    return {
        ...pickBy(g('spec'), v => !isObjectLike(v)),
        externalIPs: g('spec.externalIPs') || [],
        ports,
        matchLabels: selector,
        sessionAffinity: g('spec.sessionAffinity', 'None'),
        ipType,
        ipTypeText,
        bandWidth,
        host: name + '.' + namespace,
        template,
    };
};

const getType = template => {
    let type;
    switch (template) {
        case 'nodePort':
            type = 'NodePort';
            break;
        case 'loadBalancer':
            type = 'LoadBalancer';
            break;
        default:
            type = 'ClusterIP';
            break;
    }
    return type;
};
const getClusterIP = template => (template === 'headless' ? 'None' : undefined);
const effectKeys = [
    'ports',
    'type',
    'clusterIP',
    'externalIPs',
    'selector',
    'sessionAffinity',
];
export function toK8SObject(model) {
    const g = getFromModel(model);
    const template = g('spec.template');
    return zipObjectDeep(effectKeys, [
        g('spec.ports').map(p => {
            const port = {
                name: p.name,
                protocol: p.protocol,
                port: toNumber(p.port),
                targetPort: toNumber(p.targetPort),
            };
            if (template === 'nodePort') {
                port.nodePort = toNumber(p.nodePort);
            }

            return port;
        }),
        getType(template),
        getClusterIP(template),
        (template === 'external' ? g('spec.externalIPs') : undefined),
        KVtoObject(g('spec.matchLabels'), 'key', 'value'),
        g('spec.sessionAffinity'),
    ]);
}

export function toPatchObject(model) {
    const pureSourceSpec = model.puresource.spec;
    const newK8SSpecObject = toK8SObject(model);
    const remains = omit(pureSourceSpec, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}
