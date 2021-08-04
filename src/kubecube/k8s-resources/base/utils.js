import { get, keys, zipObject, unset, set } from 'lodash';

export const getFromModel = model => {
    return (path, _default = undefined) => get(model, path, _default);
};
export const toObjectArray = (obj, labelStr, valueStr) => {
    return keys(obj).map(k => ({ [labelStr]: k, [valueStr]: obj[k] }));
};
export const KVtoObject = (target = [], key, value) => {
    const existLabels = target.filter(i => i[key]);
    return zipObject(
        existLabels.map(l => l[key]),
        existLabels.map(l => l[value])
    );
};
export const isFilledObject = obj => {
    return Object.values(obj).every(v => v === 0 || !!v);
};

export const genReset = (target, newObject) => {
    return path => {
        if (!get(newObject, path)) {
            unset(target, path);
        } else {
            set(target, path, get(newObject, path));
        }
    };
};
