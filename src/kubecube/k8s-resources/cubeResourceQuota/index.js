import { get } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
} from '../base/config';

import { getFromModel } from '../base/utils';
import {
    unitConvertMemory,
    unitConvertCPU,
} from 'kubecube/utils/functional';

const defaultHard = {
    'requestsCpu': '', // 请求cpu
    'limitsCpu': '', // 上限cpu
    'requestsMemory': '', // 请求内存
    'limitsMemory': '', // 上限内存
    'requestsNvidiaGpu': '', // 请求gpu
    'requestsStorage': '', // 请求存储
};
export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    const hard = {
        'limitsCpu': g('spec.hard["limits.cpu"]') ? unitConvertCPU(g('spec.hard["limits.cpu"]')) : 0, // 请求cpu
        'requestsCpu': g('spec.hard["requests.cpu"]') ? unitConvertCPU(g('spec.hard["requests.cpu"]')) : 0, // 上限cpu
        'limitsMemory': g('spec.hard["limits.memory"]') ? unitConvertMemory(g('spec.hard["limits.memory"]')) : 0, // 请求内存
        'requestsMemory': g('spec.hard["requests.memory"]') ? unitConvertMemory(g('spec.hard["requests.memory"]')) : 0, // 上限内存
        'requestsNvidiaGpu': g('spec.hard["requests.nvidia.com/gpu"]') ? unitConvertCPU(g('spec.hard["requests.nvidia.com/gpu"]')) : 0, // 请求gpu
        'requestsStorage': g('spec.hard["requests.storage"]') ? unitConvertMemory(g('spec.hard["requests.storage"]'), 'Gi') : 0, // 请求存储
    };
    return {
        ...obj,
        spec: {
            hard: Object.assign({}, defaultHard, hard),
            target: g('spec.target'),
        },
        status: {
            hard: { // 总配额
                cpu: g('status.hard["requests.cpu"]') ? unitConvertCPU(g('status.hard["requests.cpu"]')) : 0,
                limitsCpu: g('status.hard["limits.cpu"]') ? unitConvertCPU(g('status.hard["limits.cpu"]')) : 0,
                memory: g('status.hard["requests.memory"]') ? unitConvertMemory(g('status.hard["requests.memory"]')) : 0,
                limitsMemory: g('status.hard["limits.memory"]') ? unitConvertMemory(g('status.hard["limits.memory"]')) : 0,
                gpu: g('status.hard["requests.nvidia.com/gpu"]') ? unitConvertCPU(g('status.hard["requests.nvidia.com/gpu"]')) : 0,
                storage: g('status.hard["requests.storage"]') ? unitConvertMemory(g('status.hard["requests.storage"]'), 'Gi') : 0,
            },
            used: { // 已用配额
                cpu: g('status.used["requests.cpu"]') ? unitConvertCPU(g('status.used["requests.cpu"]')) : 0,
                limitsCpu: g('status.used["limits.cpu"]') ? unitConvertCPU(g('status.used["limits.cpu"]')) : 0,
                memory: g('status.used["requests.memory"]') ? unitConvertMemory(g('status.used["requests.memory"]')) : 0,
                limitsMemory: g('status.used["limits.memory"]') ? unitConvertMemory(g('status.used["limits.memory"]')) : 0,
                gpu: g('status.used["requests.nvidia.com/gpu"]') ? unitConvertMemory(g('status.used["requests.nvidia.com/gpu"]')) : 0,
                storage: g('status.used["requests.storage"]') ? unitConvertMemory(g('status.used["requests.storage"]'), 'Gi') : 0,
            },
        },
        requestsMemory: '',
        limitsMemory: '',
    };
}

export function toK8SObject(model, tenant, clusterName) {
    const g = getFromModel(model);
    const obj = {
        apiVersion: 'quota.kubecube.io/v1',
        kind: 'CubeResourceQuota',
        metadata: {
            name: `${clusterName}.${tenant}`, // 名称
            labels: {
                'kubecube.io/cluster': clusterName, // 集群名
                'kubecube.io/tenant': tenant, // 租户名
            },
            annotations: {
                'kubecube.io/sync': 'true',
            },
        },
        spec: {
            hard: { // 总配额
                'requests.cpu': g('spec.hard["requestsCpu"]'),
                'limits.cpu': g('spec.hard["limitsCpu"]'),
                'requests.memory': g('spec.hard["requestsMemory"]') + 'Mi',
                'limits.memory': g('spec.hard["limitsMemory"]') + 'Mi',
                'requests.nvidia.com/gpu': g('spec.hard["requestsNvidiaGpu"]') || 0,
                'requests.storage': g('spec.hard["requestsStorage"]') + 'Gi',
            },
            target: {
                name: tenant,
                kind: 'Tenant',
            },
        },
    };

    return {
        ...obj,
    };
}

export function patchK8SObject(model) {
    const obj = toK8SObject(model);
    return {
        spec: {
            hard: get(obj, 'spec.hard'),
        },

    };
}
