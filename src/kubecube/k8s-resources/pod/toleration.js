import { toNumber } from 'lodash';
export const operators = [ 'Exists', 'Equal' ];
export const effects = [ 'NoSchedule', 'PreferNoSchedule', 'NoExecute' ];
export const getDefaultToleration = () => ({
    key: '',
    operator: 'Equal',
    value: '',
    effect: null,
    tolerationSeconds: '',
});

export const resolveToleration = tolerations => {
    return tolerations.map(t => Object.assign(getDefaultToleration(), t));
};


export const refactToleration = tolerations => {
    return tolerations.filter(t => {
        if (t.operator === 'Equal') {
            return t.key.trim();
        }
        return true;
    }).map(t => ({
        ...t,
        tolerationSeconds: t.tolerationSeconds ? toNumber(t.tolerationSeconds) : undefined,
        value: t.operator === 'Exists' ? undefined : t.value,
    }));
};
