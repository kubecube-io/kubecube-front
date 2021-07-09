import {
    pickBy,
    isObjectLike,
} from 'lodash';
import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const g = getFromModel(model);
    return {
        ...pickBy(g('status'), v => !isObjectLike(v)),
        active: g('status.active', []),
    };
};
