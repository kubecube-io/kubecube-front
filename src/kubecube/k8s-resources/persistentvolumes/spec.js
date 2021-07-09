// import { pickBy, isObjectLike } from 'lodash';
import { getFromModel } from '../base/utils';


export const toPlainObject = model => {
    const g = getFromModel(model);
    return g('spec');
};
