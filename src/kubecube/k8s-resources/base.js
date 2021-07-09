import { get, keys, zipObject } from 'lodash';
export const getFromModel = model => {
    return (path, _default = undefined) => get(model, path, _default);
};
export const toObjectArray = (obj, labelStr, valueStr) => {
    return keys(obj).map(k => ({ [labelStr]: k, [valueStr]: obj[k] }));
};
export const KVtoObject = (target = [], key, value) => {
    const existLabels = target.filter(i => i.key);
    return zipObject(
        existLabels.map(l => l[key]),
        existLabels.map(l => l[value])
    );
};
export const isFilledObject = obj => {
    return Object.values(obj).every(v => v === 0 || !!v);
};

export const toPlainObject = model => {
    const g = getFromModel(model);
    return {
        apiVersion: g('apiVersion'),
        kind: g('kind'),
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    return {
        apiVersion: g('apiVersion'),
        kind: g('kind'),
    };
};
