import { isObject, get as getFunc, set } from 'lodash';
export function traverse(obj, callback) {
    let stack = [];
    const keys = Object.keys(obj);

    stack = stack.concat(keys);
    while (stack.length > 0) {
        const key = stack.shift();
        const p = getFunc(obj, key);
        if (!callback(key, p)) {
            return false;
        }
        if (isObject(p)) {
            const keys = Object.keys(p);
            stack = stack.concat(keys.map(k => `${key}.${k}`));
        }
    }
}
export function setValue(obj, path, val) {
    let target;
    if (!path) {
        target = obj;
    } else {
        target = getFunc(obj, path);
    }

    if (isObject(target)) {
        traverse(target, function(key, value) {
            if (!isObject(value)) {
                set(target, key, val);
            }
            return true;
        });
    } else {
        set(obj, path, val);
    }
}
