
import {
    toPlainObject as toWorkloadPlainObject,
    toK8SObject as toWorkloadK8SObject,
    toModifyK8SObject as toModifyWorkloadK8SObject,
} from '../base/workload';

import {
    toPlainObject as toSpecPlainObject,
    toK8SObject as toSpecK8SObject,
    toModifyK8SObject as toModifySpecK8SObject,
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
    const obj = toWorkloadK8SObject(model)({
        apiVersion: 'apps/v1',
        kind: 'DaemonSet',
        toSpecK8SObject,
    });

    obj.metadata.labels['system/tenant'] = model.spec.level.ind === 'platform' ? 'netease.share' : model.spec.level.tenant;
    return obj;
}

// export function toModifyK8SObject(model) {
//     const obj = toWorkloadK8SObject(model)({
//         apiVersion: 'apps/v1',
//         kind: 'DaemonSet',
//         toSpecK8SObject,
//     });

//     obj.metadata.labels['system/tenant'] = model.spec.level.ind === 'platform' ? 'netease.share' : model.spec.level.tenant;
//     return obj;
// }

export function toModifyK8SObject(model) {
    return toModifyWorkloadK8SObject(model)({
        apiVersion: 'apps/v1',
        kind: 'DaemonSet',
        toSpecK8SObject,
        toModifyK8SObject: toModifySpecK8SObject,
    });
}
