import {
    toPlainObject as toConfigPlainObject,
} from '../base/config';

import { getFromModel } from '../base/utils';

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        names: g('spec.names'),
        group: g('spec.group'),
        versions: (g('spec.versions') || []).map(v => v.name),
    };
}
