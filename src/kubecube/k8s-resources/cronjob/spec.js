import {
    toNumber,
} from 'lodash';
import {
    getFromModel,
    toObjectArray,
    genReset,
} from '../base/utils';
import {
    toK8SObject as toJobSpecK8SObject,
    toModifyK8SObject as toModifyJobK8SObject,
} from '../job/spec';

export const toPlainObject = model => {
    const g = getFromModel(model);
    return {
        // ...pickBy(g('spec'), v => !isObjectLike(v)),
        concurrencyPolicy: g('spec.concurrencyPolicy', 'Allow'), // 并发策略
        schedule: g('spec.schedule'), // 定时调度设置
        successfulJobsHistoryLimit: g('spec.successfulJobsHistoryLimit'), // 保留执行成功任务的个数
        failedJobsHistoryLimit: g('spec.failedJobsHistoryLimit'), // 保留执行失败任务的个数
        startingDeadlineSeconds: g('spec.startingDeadlineSeconds'), // 任务启动截止时间
        matchLabels: toObjectArray(g('spec.selector.matchLabels', {}), 'key', 'value'),
        suspend: g('spec.suspend'), // 是否暂停
    };
};

export const toK8SObject = (model, metadata, obj) => {
    const g = getFromModel(model);
    const template = obj.spec.template;
    return {
        concurrencyPolicy: toNumber(g('spec.concurrencyPolicy')), // 并发策略
        schedule: g('spec.schedule'), // 定时调度设置 
        successfulJobsHistoryLimit: toNumber(g('spec.successfulJobsHistoryLimit')), // 保留执行成功任务的个数
        failedJobsHistoryLimit: toNumber(g('spec.failedJobsHistoryLimit')), // 保留执行失败任务的个数
        startingDeadlineSeconds: g('spec.startingDeadlineSeconds') && toNumber(g('spec.startingDeadlineSeconds')), // 任务启动截止时间
        template: undefined,
        jobTemplate: { // 指定执行 CronJob 时将创建的作业
            spec: {
                ...toJobSpecK8SObject(g('jobTemplate')),
                template,
                selector: undefined,
            },
        },
    };
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.concurrencyPolicy');
    resetProperty('spec.schedule');
    resetProperty('spec.successfulJobsHistoryLimit');
    resetProperty('spec.failedJobsHistoryLimit');
    resetProperty('spec.startingDeadlineSeconds');
    toModifyJobK8SObject(target.jobTemplate, model.jobTemplate);
};
