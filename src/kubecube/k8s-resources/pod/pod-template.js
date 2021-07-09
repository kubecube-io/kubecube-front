import { get } from 'lodash';
import {
    toPlainObject as toBasePlainObject,
    getFromModel,
} from '../base';
import {
    toPlainObject as toMetadataPlainObject,
    // toK8SObject as toMetadataK8SObject,
} from '../metadata';

import {
    toPlainObject as toPodSpecPlainObject,
} from './pod-spec';

export const toPlainObject = model => {
    const g = getFromModel(model);
    return {
        metadata: toMetadataPlainObject(model),
        spec: toPodSpecPlainObject(g('spec')),
    };
};
