import {
    toPlainObject as toCommonPlainObject,
} from '../base/common';
import {
    toPlainObject as toSpecPlainObject,
} from './spec';

import {
    toPlainObject as toStatusPlainObject,
} from './status';

export function toPlainObject(model) {
    return toCommonPlainObject(model)({
        toSpecPlainObject,
        toStatusPlainObject,
    });
}
