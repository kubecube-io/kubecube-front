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
    'requests.cpu': '',
    'limits.cpu': '',
    'requests.memory': '',
    'limits.memory': '',
    'requests.nvidia.com/gpu': '',
    'requests.storage': '',
};
export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    const hard = {
        'requests.cpu': g('spec.hard["limits.cpu"]') ? unitConvertCPU(g('spec.hard["limits.cpu"]')) : 0,
        'requests.memory': g('spec.hard["limits.memory"]') ? unitConvertMemory(g('spec.hard["limits.memory"]')) : 0,
        'requests.nvidia.com/gpu': g('spec.hard["limits.gpu"]') ? unitConvertCPU(g('spec.hard["limits.gpu"]')) : 0,
    };
    return {
        ...obj,
        spec: {
            hard: Object.assign({}, defaultHard, hard),
            target: g('spec.target'),
        },
        status: {
            hard: {
                cpu: g('status.hard["limits.cpu"]') ? unitConvertCPU(g('status.hard["limits.cpu"]')) : 0,
                memory: g('status.hard["limits.memory"]') ? unitConvertMemory(g('status.hard["limits.memory"]')) : 0,
                gpu: g('status.hard["limits.gpu"]') ? unitConvertCPU(g('status.hard["limits.gpu"]')) : 0,
            },
            used: {
                cpu: g('status.used["limits.cpu"]') ? unitConvertCPU(g('status.used["limits.cpu"]')) : 0,
                memory: g('status.used["limits.memory"]') ? unitConvertMemory(g('status.used["limits.memory"]')) : 0,
                gpu: g('status.used["limits.gpu"]') ? unitConvertCPU(g('status.used["limits.gpu"]')) : 0,
            },
        },
    };
}

export function toK8SObject(model, tenant, clusterName) {
    const g = getFromModel(model);
    const obj = {
        apiVersion: 'quota.kubecube.io/v1',
        kind: 'CubeResourceQuota',
        metadata: {
            name: `${clusterName}.${tenant}`,
            labels: {
                'kubecube.io/cluster': clusterName,
                'kubecube.io/tenant': tenant,
            },
            annotations: {
                'kubecube.io/sync': 'true',
            },
        },
        spec: {
            hard: {
                'requests.cpu': g('spec.hard["requests.cpu"]'),
                'limits.cpu': g('spec.hard["requests.cpu"]'),
                'requests.memory': g('spec.hard["requests.memory"]') + 'Mi',
                'limits.memory': g('spec.hard["requests.memory"]') + 'Mi',
                'requests.nvidia.com/gpu': g('spec.hard["requests.nvidia.com/gpu"]') || 0,
                // 'requests.storage': g('spec.hard["requests.storage"]'),
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
