import {
    toNumber,
} from 'lodash';
import {
    getFromModel,
    genReset,
} from '../base/utils';
import {
    toPlainObject as toSelectorPlainObject,
} from '../label-selector';

export const toPlainObject = model => {
    const g = getFromModel(model);
    const minReadySeconds = g('spec.minReadySeconds'); // 最短就绪时间
    const maxSurge = g('spec.strategy.rollingUpdate.maxSurge'); // 最大超预期副本数
    const maxUnavailable = g('spec.strategy.rollingUpdate.maxUnavailable'); // 最大不可用副本数
    const strategy = {
        type: g('spec.strategy.type'), // 更新类型
        enable: !!(minReadySeconds || maxSurge || maxUnavailable),
        minReadySeconds, // 最短就绪时间
        maxSurge, // 最大超预期副本数
        maxUnavailable, // 最大不可用副本数
    };
    return {
        // progressDeadlineSeconds: g('spec.progressDeadlineSeconds'),
        replicas: g('spec.replicas', 1), // 副本数
        ...toSelectorPlainObject(g('spec')), // selector 字段，定义 Deployment 如何查找要管理的 Pods
        strategy, // 更新策略
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    const obj = {
        replicas: toNumber(g('spec.replicas')), // 副本数
    };
    const minReadySeconds = toNumber(g('spec.strategy.minReadySeconds')); // 最短就绪时间
    const maxSurge = `${g('spec.strategy.maxSurge')}`.endsWith('%') ? g('spec.strategy.maxSurge') : toNumber(g('spec.strategy.maxSurge')); // 最大超预期副本数
    const maxUnavailable = `${g('spec.strategy.maxUnavailable')}`.endsWith('%') ? g('spec.strategy.maxUnavailable') : toNumber(g('spec.strategy.maxUnavailable')); // 最大不可用副本数
    if (minReadySeconds || minReadySeconds === 0 || maxSurge || maxSurge === 0 || maxUnavailable || maxUnavailable === 0) {
        obj.strategy = {
            rollingUpdate: {
                type: 'RollingUpdate', // 更新类型
            },
        };

        if (minReadySeconds || minReadySeconds === 0) {
            obj.minReadySeconds = minReadySeconds;
        }
        if (maxSurge || maxSurge === 0) {
            obj.strategy.rollingUpdate.maxSurge = maxSurge;
        }
        if (maxUnavailable || maxUnavailable === 0) {
            obj.strategy.rollingUpdate.maxUnavailable = maxUnavailable;
        }
    }
    return obj;
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.replicas'); // 副本数
    resetProperty('spec.minReadySeconds'); // 最短就绪时间
    resetProperty('spec.strategy.rollingUpdate.maxSurge'); // 最大超预期副本数
    resetProperty('spec.strategy.rollingUpdate.maxUnavailable'); // 最大不可用副本数
};
