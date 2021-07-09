import { pickBy, isObjectLike } from 'lodash';
import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    return {
        ...pickBy(model, v => !isObjectLike(v)),
        conditions: cg('status.conditions', []),
    };
};
