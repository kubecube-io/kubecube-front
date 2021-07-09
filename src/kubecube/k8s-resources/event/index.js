import { pick } from 'lodash';
import {
    toPlainObject as toMetadataPlainObject,
} from '../metadata';

export const toPlainObject = model => {
    const obj = {
        metadata: toMetadataPlainObject(model),
        ...pick(model, [
            'count',
            'message',
            'reason',
            'firstTimestamp',
            'lastTimestamp',
            'involvedObject.fieldPath',
        ]),

    };
    console.log(obj);
    return obj;
};
