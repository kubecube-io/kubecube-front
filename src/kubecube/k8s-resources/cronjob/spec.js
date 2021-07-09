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
        concurrencyPolicy: g('spec.concurrencyPolicy', 'Allow'),
        schedule: g('spec.schedule'),
        successfulJobsHistoryLimit: g('spec.successfulJobsHistoryLimit'),
        failedJobsHistoryLimit: g('spec.failedJobsHistoryLimit'),
        startingDeadlineSeconds: g('spec.startingDeadlineSeconds'),
        matchLabels: toObjectArray(g('spec.selector.matchLabels', {}), 'key', 'value'),
    };
};

export const toK8SObject = (model, metadata, obj) => {
    const g = getFromModel(model);
    const template = obj.spec.template;
    return {
        concurrencyPolicy: toNumber(g('spec.concurrencyPolicy')),
        schedule: g('spec.schedule'),
        successfulJobsHistoryLimit: toNumber(g('spec.successfulJobsHistoryLimit')),
        failedJobsHistoryLimit: toNumber(g('spec.failedJobsHistoryLimit')),
        startingDeadlineSeconds: g('spec.startingDeadlineSeconds') && toNumber(g('spec.startingDeadlineSeconds')),
        template: undefined,
        jobTemplate: {
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
