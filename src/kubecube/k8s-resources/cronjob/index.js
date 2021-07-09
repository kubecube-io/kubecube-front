import {
    toPlainObject as toWorkloadPlainObject,
    toK8SObject as toWorkloadK8SObject,
    toModifyK8SObject as toModifyWorkloadK8SObject,
} from '../base/workload';
import { getFromModel } from '../base/utils';

import {
    toPlainObject as toSpecPlainObject,
    toK8SObject as toSpecK8SObject,
    toModifyK8SObject as toModifySpecK8SObject,
} from './spec';

import {
    toPlainObject as toStatusPlainObject,
} from './status';

import {
    toPlainObject as toJobSpecPlainObject,
} from '../job/spec';

const podTemplatePath = 'spec.jobTemplate.spec.template';
export function toPlainObject(model) {
    const g = getFromModel(model);
    const obj = {
        ...toWorkloadPlainObject(model)({
            toSpecPlainObject,
            toStatusPlainObject,
            podTemplatePath,
            containerPath: 'spec.jobTemplate.spec.template.spec',
        }),
    };
    const jobTemplate = toJobSpecPlainObject(g('spec.jobTemplate.spec'), obj.containers, obj.podTemplate);

    return {
        ...obj,
        jobTemplate,
    };
}

export function toK8SObject(model) {
    return toWorkloadK8SObject(model)({
        apiVersion: 'batch/v1beta1',
        kind: 'CronJob',
        toSpecK8SObject,
    });
}

export function toModifyK8SObject(model) {
    return toModifyWorkloadK8SObject(model)({
        apiVersion: 'batch/v1beta1',
        kind: 'CronJob',
        toSpecK8SObject,
        toModifyK8SObject: toModifySpecK8SObject,
        podTemplatePath,
    });
}
