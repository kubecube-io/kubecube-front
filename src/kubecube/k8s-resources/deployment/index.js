import {
    toPlainObject as toWorkloadPlainObject,
    toK8SObject as toWorkloadK8SObject,
    toModifyK8SObject as toModifyWorkloadK8SObject,
} from '../base/workload';

import {
    toPlainObject as toSpecPlainObject,
    toK8SObject as toSpecK8SObject,
    toModifyK8SObject as toModifySpecK8SObject,
} from './spec'; // spec相关转换函数

import {
    toPlainObject as toStatusPlainObject,
} from './status'; // status相关转换函数

export function toPlainObject(model) {
    return toWorkloadPlainObject(model)({
        toSpecPlainObject,
        toStatusPlainObject,
    });
}

export function toK8SObject(model) {
    return toWorkloadK8SObject(model)({
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        toSpecK8SObject,
    });
}


export function toModifyK8SObject(model) {
    return toModifyWorkloadK8SObject(model)({
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        toSpecK8SObject,
        toModifyK8SObject: toModifySpecK8SObject,
    });
}
