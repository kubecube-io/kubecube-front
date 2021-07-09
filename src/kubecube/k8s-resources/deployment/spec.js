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
    const minReadySeconds = g('spec.minReadySeconds');
    const maxSurge = g('spec.strategy.rollingUpdate.maxSurge');
    const maxUnavailable = g('spec.strategy.rollingUpdate.maxUnavailable');
    const strategy = {
        type: g('spec.strategy.type'),
        enable: !!(minReadySeconds || maxSurge || maxUnavailable),
        minReadySeconds,
        maxSurge,
        maxUnavailable,
    };
    return {
        // progressDeadlineSeconds: g('spec.progressDeadlineSeconds'),
        replicas: g('spec.replicas', 1),
        ...toSelectorPlainObject(g('spec')),
        strategy,
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    const obj = {
        replicas: toNumber(g('spec.replicas')),
    };
    const minReadySeconds = toNumber(g('spec.strategy.minReadySeconds'));
    const maxSurge = toNumber(g('spec.strategy.maxSurge'));
    const maxUnavailable = toNumber(g('spec.strategy.maxUnavailable'));
    if (minReadySeconds || minReadySeconds === 0 || maxSurge || maxUnavailable) {
        obj.strategy = {
            rollingUpdate: {
                type: 'RollingUpdate',
            },
        };

        if (minReadySeconds || minReadySeconds === 0) {
            obj.minReadySeconds = minReadySeconds;
        }
        if (maxSurge) {
            obj.strategy.rollingUpdate.maxSurge = maxSurge;
        }
        if (maxUnavailable) {
            obj.strategy.rollingUpdate.maxUnavailable = maxUnavailable;
        }
    }
    return obj;
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.replicas');
    resetProperty('spec.minReadySeconds');
    resetProperty('spec.strategy.rollingUpdate.maxSurge');
    resetProperty('spec.strategy.rollingUpdate.maxUnavailable');
};
