import {
    toPlainObject as toWorkloadPlainObject,
    toK8SObject as toWorkloadK8SObject,
    // toModifyK8SObject as toModifyWorkloadK8SObject,
} from '../base/workload';

import {
    toPlainObject as toSpecPlainObject,
    toK8SObject as toSpecK8SObject,
} from './spec';

import {
    toPlainObject as toStatusPlainObject,
} from './status';

export function toPlainObject(model) {
    return toWorkloadPlainObject(model)({
        toSpecPlainObject,
        toStatusPlainObject,
    });
}

export function toK8SObject(model) {
    return toWorkloadK8SObject(model)({
        apiVersion: 'batch/v1',
        kind: 'Job',
        toSpecK8SObject,
    });
}
