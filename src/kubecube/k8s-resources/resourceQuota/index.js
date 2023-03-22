import { pickBy, isUndefined } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
} from '../base/config';

import { getFromModel } from '../base/utils';

import {
    unitConvertMemory,
    unitConvertCPU,
} from 'kubecube/utils/functional';

// const defaultHard = {
//     'requests.cpu': '',
//     'limits.cpu': '',
//     'requests.memory': '',
//     'limits.memory': '',
//     'requests.nvidia.com/gpu': '',
//     'requests.storage': '',
// };
export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    const hard = {};
    const raw = g('spec.hard') || {};
    Object.keys(raw).forEach(k => {
        hard[k] = parseInt(raw[k]);
    });
    return {
        ...obj,
        spec: {
            hard: {
                cpu: g('spec.hard["requests.cpu"]') ? unitConvertCPU(g('spec.hard["requests.cpu"]')) : 0,
                limitsCpu: g('spec.hard["limits.cpu"]') ? unitConvertCPU(g('spec.hard["limits.cpu"]')) : 0,
                memory: g('spec.hard["requests.memory"]') ? unitConvertMemory(g('spec.hard["requests.memory"]')) : 0,
                limitsMemory: g('spec.hard["limits.memory"]') ? unitConvertMemory(g('spec.hard["limits.memory"]')) : 0,
                gpu: g('spec.hard["requests.nvidia.com/gpu"]') ? unitConvertCPU(g('spec.hard["requests.nvidia.com/gpu"]')) : 0,
                storage: g('spec.hard["requests.storage"]') ? unitConvertMemory(g('spec.hard["requests.storage"]'), 'Gi') : 0,
            },
            target: g('spec.target'),
        },
        status: {
            hard: {
                cpu: g('status.hard["requests.cpu"]') ? unitConvertCPU(g('status.hard["requests.cpu"]')) : 0,
                limitsCpu: g('status.hard["limits.cpu"]') ? unitConvertCPU(g('status.hard["limits.cpu"]')) : 0,
                memory: g('status.hard["requests.memory"]') ? unitConvertMemory(g('status.hard["requests.memory"]')) : 0,
                limitsMemory: g('status.hard["limits.memory"]') ? unitConvertMemory(g('status.hard["limits.memory"]')) : 0,
                gpu: g('status.hard["requests.nvidia.com/gpu"]') ? unitConvertCPU(g('status.hard["requests.nvidia.com/gpu"]')) : 0,
                storage: g('status.hard["requests.storage"]') ? unitConvertMemory(g('status.hard["requests.storage"]'), 'Gi') : 0,
            },
            used: {
                cpu: g('status.used["requests.cpu"]') ? unitConvertCPU(g('status.used["requests.cpu"]')) : 0,
                limitsCpu: g('status.used["limits.cpu"]') ? unitConvertCPU(g('status.used["limits.cpu"]')) : 0,
                memory: g('status.used["requests.memory"]') ? unitConvertMemory(g('status.used["requests.memory"]')) : 0,
                limitsMemory: g('status.used["limits.memory"]') ? unitConvertMemory(g('status.used["limits.memory"]')) : 0,
                gpu: g('status.used["requests.nvidia.com/gpu"]') ? unitConvertCPU(g('status.used["requests.nvidia.com/gpu"]')) : 0,
                storage: g('status.used["requests.storage"]') ? unitConvertMemory(g('status.used["requests.storage"]'), 'Gi') : 0,
            }
        },
        requestsMemory: '',
        limitsMemory: '',
    };
}

export function toK8SObject(model, resource) {
    const {
        cluster, namespace, tenant, project,
    } = model;
    const g = getFromModel(resource);
    const obj = {
        apiVersion: 'v1',
        kind: 'ResourceQuota',
        metadata: {
            name: `${cluster}.${tenant}.${project}.${namespace}`,
            namespace,
            labels: {
                'kubecube.io/quota': `${cluster}.${tenant}`,
                'kubecube.io/cluster': cluster,
                'kubecube.io/tenant': tenant,
                'kubecube.io/project': project,
            },
        },
        spec: {
            hard: pickBy({
                'requests.cpu': g('spec.hard.cpu'),
                'limits.cpu': g('spec.hard.limitsCpu'),
                'requests.memory': g('spec.hard.memory') + 'Mi',
                'limits.memory': g('spec.hard.limitsMemory') + 'Mi',
                'requests.nvidia.com/gpu': g('spec.hard.gpu'),
                'requests.storage': g('spec.hard.storage') + 'Gi',
            }, v => !isUndefined(v) && v !== '0' && v !== ''),
        },
    };

    return {
        ...obj,
    };
}

export function patchK8SObject(resource) {
    const g = getFromModel(resource);
    return {
        spec: {
            hard: pickBy({
                'requests.cpu': g('spec.hard.cpu'),
                'limits.cpu': g('spec.hard.limitsCpu'),
                'requests.memory': g('spec.hard.memory') + 'Mi',
                'limits.memory': g('spec.hard.limitsMemory') + 'Mi',
                'requests.nvidia.com/gpu': g('spec.hard.gpu'),
                'requests.storage': g('spec.hard.storage') + 'Gi',
            }, v => !isUndefined(v) && v !== '0' && v !== ''),
        },

    };
}
