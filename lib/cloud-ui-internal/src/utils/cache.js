import { cloneDeep } from 'lodash';
const wm = new Map();
export const cache = {
    add(key, value, notClone) {
        wm.set(key, notClone ? value : cloneDeep(value));
    },
    get(key) {
        return wm.get(key);
    },
    has(key) {
        return wm.has(key);
    },
    clear(key) {
        return wm.delete(key);
    },
    safeGet(key, func) {
        return this.has(key) ? Promise.resolve(cache.get(key)) : func(key);
    },
};
