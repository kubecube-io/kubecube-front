import {
    pickBy,
    isObjectLike,
} from 'lodash';
import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const g = getFromModel(model);
    // const statusExtend = g('extendInfo.status');
    const status = g('status') || {};
    const conditions = g('status.conditions') || [];
    let runningStatus = 'Running';
    if (conditions.length === 0 && !status.active && !status.succeeded && !status.failed) {
        runningStatus = 'Pending';
    }

    if (conditions.length > 0) {
        for (let i = 0; i < conditions.length; i++) {
            const c = conditions[i];
            if (c.type === 'Complete' && c.status === 'True') {
                runningStatus = 'Complete';
                break;
            }
            if (c.type === 'Failed' && c.status === 'False') {
                runningStatus = 'Failed';
                break;
            }
        }
    }

    return {
        ...pickBy(g('status'), v => !isObjectLike(v)),
        conditions,
        runningStatus, // 状态
        tasks: 0,
    };
};
