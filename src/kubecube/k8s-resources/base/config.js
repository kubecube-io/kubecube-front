import { cloneDeep } from 'lodash';
import { getFromModel } from '../base/utils';

import {
    toPlainObject as toMetadataPlainObject,
    toK8SObject as toMetadataK8SObject,
    toPatchObject as toPatchMetadataObject,
} from '../metadata';

export function toPlainObject(model) {
    const g = getFromModel(model);
    const obj = {
        apiVersion: g('apiVersion'),
        kind: g('kind'),
        metadata: toMetadataPlainObject(model),
        puresource: Object.freeze(cloneDeep(model)),
    };
    return obj;
}

export function toK8SObject(
    apiVersion,
    kind,
    model
) {
    const metadata = toMetadataK8SObject(model);
    const obj = {
        apiVersion,
        kind,
        metadata,
    };
    return obj;
}

export function toPatchObject(model) {
    const metadata = toPatchMetadataObject(model);
    const obj = {
        metadata,
    };
    return obj;
}
