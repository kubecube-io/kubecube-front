import {
    toPlainObject as toCommonPlainObject,
} from '../base/common';
import {
    toPlainObject as toSpecPlainObject,
} from './spec';

export function toPlainObject(model) {
    return toCommonPlainObject(model)({
        toSpecPlainObject,
        toStatusPlainObject: () => ({}),
    });
}

