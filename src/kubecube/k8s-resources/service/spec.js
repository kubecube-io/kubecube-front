import { pickBy, isObjectLike, zipObjectDeep, toNumber, omit } from 'lodash';
import { getFromModel, toObjectArray, KVtoObject } from '../base/utils';
import {
    SERVICE_LOAD_BALANCER_IP_TYPE_MAP,
} from 'kubecube/utils/constance';

export const toPlainObject = model => {
    const g = getFromModel(model);
    const name = g('metadata.name'); // service名称
    const namespace = g('metadata.namespace'); // namespace
    const ports = (g('spec.ports') || []).map(p => ({ // Ports
        ...p,
        text: `${name}.${namespace}:${p.port}`,
    }));
    const annotations = g('metadata.annotations', {}); // annotations
    const ipType = annotations['nlb.netease.com/lb-network'] // LoadBalancer  IP类型
        || annotations['netease.com/lb-network']
        || annotations['netease.com_loadbalancer_network'];
    const ipTypeText = (SERVICE_LOAD_BALANCER_IP_TYPE_MAP[ipType] || {}).text || '-'; // LoadBalancer  IP类型（中文）
    const bandWidth = annotations['nlb.netease.com/lb-bandwidth'] // LoadBalancer  带宽
        || annotations['netease.com/lb-bandwidth']
        || annotations[`netease.com_loadbalancer_${ipType}_bandwidth`]
        || annotations['netease.com_loadbalancer_bandwidth']
        || '-';
    const type = g('spec.type'); // 类型
    const clusterIP = g('spec.clusterIP'); // clusterIP
    const selector = toObjectArray(g('spec.selector', {}), 'key', 'value'); // 标签选择器
    const bandwidthMode = bandWidth === '-' ? 'system' : 'user'; // 带宽类型（集群默认配置、自定义）
    const hasExternalIPs = !!g('spec.externalIPs');
    let template; // ClusterIP 使用方式
    if (!model) {
        template = 'normal';
    } else if (type === 'NodePort') {
        template = 'nodePort';
    } else if (type === 'LoadBalancer') {
        template = 'loadBalancer';
    } else if (clusterIP === 'None') {
        template = 'headless';
    } else if (hasExternalIPs) {
        template = 'external';
    } else {
        template = 'normal';
    }
    return {
        ...pickBy(g('spec'), v => !isObjectLike(v)),
        externalIPs: g('spec.externalIPs') || [],
        ports, // Ports
        matchLabels: selector, // 标签选择器
        sessionAffinity: g('spec.sessionAffinity', 'None'), // 会话保持
        ipType, // LoadBalancer  IP类型
        ipTypeText, // LoadBalancer  IP类型（中文）
        bandWidth, // LoadBalancer  带宽
        host: name + '.' + namespace, // service详情 - 服务详情 - 域名
        template, // ClusterIP 使用方式
        bandwidthMode, // 带宽类型（集群默认配置、自定义）
        enableSelecter: template === 'headless' ? !!selector.length : true, // headless类型是否开启selecter
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
const getClusterIP = (template, value) => (template === 'headless' ? 'None' : value);
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
        g('spec.ports').filter(i => i.port && i.targetPort).map(p => {
            const port = {
                name: p.name, // Port 名称
                protocol: p.protocol, // Port 协议
                port: toNumber(p.port), // Port 服务端口
                targetPort: toNumber(p.targetPort), // Port 目标端口
            };
            if (template === 'nodePort') {
                port.nodePort = toNumber(p.nodePort); // Port NodePort
            }

            return port;
        }),
        getType(template),
        getClusterIP(template, g('spec.clusterIP')),
        (template === 'external' ? g('spec.externalIPs') : undefined),
        (template === 'headless' && !g('spec.enableSelecter') ? undefined : KVtoObject(g('spec.matchLabels'), 'key', 'value')), // 标签选择器
        g('spec.sessionAffinity'), // 会话保持
    ]);
}

export function toPatchObject(model) {
    const pureSourceSpec = model.puresource.spec;
    const newK8SSpecObject = toK8SObject(model);
    const remains = omit(pureSourceSpec, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}
