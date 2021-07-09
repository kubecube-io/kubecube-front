import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    return cg('status');
};
