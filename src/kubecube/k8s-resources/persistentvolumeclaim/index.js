import {
    toPlainObject as toCommonPlainObject,
    toK8SObject as toCommonK8SObject,
} from '../base/common';
import { getFromModel } from '../base/utils';
import {
    toPlainObject as toSpecPlainObject,
    toK8SObject as toSpecK8SObject,
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
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        toSpecK8SObject,
    });
}

export function patchK8SObject(model) {
    // const obj = toPatchConfigObject(model);
    const newK8SSpecObject = toK8SObject(model);
    const g = getFromModel(newK8SSpecObject);
    return {
        spec: {
            resources: {
                requests: {
                    storage: g('spec.resources.requests.storage'),
                },
            },
        },
    };
}

