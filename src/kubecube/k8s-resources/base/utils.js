import { get, keys, zipObject, unset, set } from 'lodash';

export const getFromModel = model => { // 对get函数封装
    return (path, _default = undefined) => get(model, path, _default);
};
export const toObjectArray = (obj, labelStr, valueStr) => { // 对象转数组 { field1: 'a', field2: 'b'} -> [{ key: 'field1', value: 'a' }, { key: 'field2', value: 'b' }]
    return keys(obj).map(k => ({ [labelStr]: k, [valueStr]: obj[k] }));
};
export const KVtoObject = (target = [], key, value) => { // //数组转对象 [{ key: 'field1', value: 'a' }, { key: 'field2', value: 'b' }] -> { field1: 'a', field2: 'b'}
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
        if (!get(newObject, path) && get(newObject, path) !== 0) {
            unset(target, path);
        } else {
            set(target, path, get(newObject, path));
        }
    };
};
