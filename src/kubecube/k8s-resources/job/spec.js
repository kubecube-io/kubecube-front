import {
    pickBy,
    isObjectLike,
    toNumber,
} from 'lodash';
import {
    getFromModel,
    toObjectArray,
    genReset,
} from '../base/utils';

export const toPlainObject = (model, containers, podTemplate) => {
    const g = getFromModel(model);
    if (!g('spec.template.spec.restartPolicy')) { // 重启策略
        podTemplate.spec.restartPolicy = 'OnFailure';
    }

    return {
        ...pickBy(g('spec'), v => !isObjectLike(v)),
        completions: g('spec.completions', 1), // 预期成功执行数
        parallelism: g('spec.parallelism', 1), // 并行数
        activeDeadlineSeconds: g('spec.activeDeadlineSeconds'), // 超时时间
        backoffLimit: g('spec.backoffLimit', 6), // 重试次数
        matchLabels: toObjectArray(g('spec.selector.matchLabels', {}), 'key', 'value'),
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    const obj = {
        completions: toNumber(g('spec.completions')), // 预期成功执行数
        parallelism: toNumber(g('spec.parallelism')), // 并行数
        backoffLimit: toNumber(g('spec.backoffLimit')), // 重试次数
        selector: {},
    };
    const activeDeadlineSeconds = g('spec.activeDeadlineSeconds'); // 超时时间
    if (activeDeadlineSeconds) {
        obj.activeDeadlineSeconds = toNumber(activeDeadlineSeconds);
    }
    return obj;
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.completions');
    resetProperty('spec.parallelism');
    resetProperty('spec.backoffLimit');
    resetProperty('spec.activeDeadlineSeconds');
};
