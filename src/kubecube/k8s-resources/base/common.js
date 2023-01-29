import { cloneDeep } from 'lodash';
import { getFromModel } from '../base/utils';

import {
    toPlainObject as toMetadataPlainObject,
    toK8SObject as toMetadataK8SObject,
    toPatchObject as toPatchMetadataObject,
    toModifyObject as toModifyMetadataK8SObject
} from '../metadata';

export function toPlainObject(model) {
    const g = getFromModel(model);
    return ({
        toSpecPlainObject,
        toStatusPlainObject,
    }) => {
        const obj = {
            apiVersion: g('apiVersion'), // api版本
            kind: g('kind'), // 资源类型
            spec: toSpecPlainObject(model), // spec转换
            metadata: toMetadataPlainObject(model), // metadata转换
            status: toStatusPlainObject(model), //status转换
            puresource: Object.freeze(cloneDeep(model)), // 原始数据
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
        const metadata = toMetadataK8SObject(model); // metadata 转换
        const obj = {
            apiVersion, // api版本
            kind, // 资源类型
            metadata, // metadata
            spec: toSpecK8SObject(model, metadata), //  spec
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

export function toModifyK8SObject(model) {
    return ({
        apiVersion,
        kind,
        toModifySpecObject,
    }) => {
        const metadata = toModifyMetadataK8SObject(model);
        const obj = {
            apiVersion,
            kind,
            metadata,
            spec: toModifySpecObject(model, metadata),
        };
        return obj;
    };
}