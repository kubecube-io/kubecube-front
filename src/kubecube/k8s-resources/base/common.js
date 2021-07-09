import { cloneDeep } from 'lodash';
import { getFromModel } from '../base/utils';

import {
    toPlainObject as toMetadataPlainObject,
    toK8SObject as toMetadataK8SObject,
    toPatchObject as toPatchMetadataObject,
} from '../metadata';

export function toPlainObject(model) {
    const g = getFromModel(model);
    return ({
        toSpecPlainObject,
        toStatusPlainObject,
    }) => {
        const obj = {
            apiVersion: g('apiVersion'),
            kind: g('kind'),
            spec: toSpecPlainObject(model),
            metadata: toMetadataPlainObject(model),
            status: toStatusPlainObject(model),
            puresource: Object.freeze(cloneDeep(model)),
        };
        return obj;
    };
}

export function toK8SObject(model) {
    return ({
        apiVersion,
        kind,
        toSpecK8SObject,
    }) => {
        const metadata = toMetadataK8SObject(model);
        const obj = {
            apiVersion,
            kind,
            metadata,
            spec: toSpecK8SObject(model, metadata),
        };
        return obj;
    };
}

export function toPatchObject(model) {
    return ({
        toPatchSpecObject,
    }) => {
        const metadata = toPatchMetadataObject(model);
        const obj = {
            metadata,
            spec: toPatchSpecObject(model, metadata),
        };
        return obj;
    };
}
