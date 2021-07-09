import { zipObjectDeep } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
    toPatchObject as toPatchConfigObject,
} from '../base/config';
import {
    toObjectArray,
    KVtoObject,
} from '../base/utils';
import { getFromModel } from '../base/utils';

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        type: g('type', 'Opaque'),
        data: toObjectArray(g('data') || {}, 'key', 'value'),
    };
}

export function toK8SObject(model) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'v1',
        'ConfigMap',
        model
    );
    const data = KVtoObject(g('data'), 'key', 'value');

    return {
        ...obj,
        data,
    };
}

export function patchK8SObject(model) {
    const obj = toPatchConfigObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        data: KVtoObject(g('data'), 'key', 'value'),
    };
}
