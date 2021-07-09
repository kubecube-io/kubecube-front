import {
    toPlainObject as toCommonPlainObject,
    toK8SObject as toCommonK8SObject,
    toPatchObject as toPatchCommonObject,
} from '../base/common';
import {
    toPlainObject as toSpecPlainObject,
    toK8SObject as toSpecK8SObject,
    patchK8SObject as toPatchSpecObject,
} from './spec';

import {
    toPlainObject as toStatusPlainObject,
} from './status';

export function toPlainObject(model) {
    return toCommonPlainObject(model)({
        toSpecPlainObject,
        toStatusPlainObject,
    });
}

export function toK8SObject(model) {
    return toCommonK8SObject(model)({
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        toSpecK8SObject,
    });
}

export function patchK8SObject(model) {
    return toPatchCommonObject(model)({
        toPatchSpecObject,
    });
}
