import { pick } from 'lodash';
import {
    toPlainObject as toMetadataPlainObject,
} from '../metadata';

export const toPlainObject = model => {
    const obj = {
        metadata: toMetadataPlainObject(model),
        ...pick(model, [
            'count',
            'message', // 消息
            'reason', // 原因
            'firstTimestamp', // 首次出现时间
            'lastTimestamp', // 上次出现时间
            'involvedObject.fieldPath', // 事件对象filePath
        ]),

    };
    // console.log(obj);
    return obj;
};
