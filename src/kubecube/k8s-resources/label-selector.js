import {
    omitBy,
    isEmpty,
    zipObjectDeep,
} from 'lodash';
import {
    getFromModel,
    toObjectArray,
    KVtoObject,
} from './base';

export const toPlainObject = (model, mode = 'normal') => {
    const g = getFromModel(model);
    const obj = {
        matchLabels: toObjectArray(g('selector.matchLabels', {}), 'key', 'value'),
    };
    return obj;
};


export const toK8SObject = model => {};
