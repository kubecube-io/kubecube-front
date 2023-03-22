import {
    toPlainObject as toConfigPlainObject,
} from '../base/config';

import { getFromModel } from '../base/utils';

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        names: g('spec.names'), // 名称
        group: g('spec.group'), // 组
        versions: (g('spec.versions') || []).map(v => v.name), // 本版
    };
}
