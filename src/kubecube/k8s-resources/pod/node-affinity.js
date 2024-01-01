import {
    getFromModel,
} from '../base';
import {
    resolveLableSelector,
    refactLableSelector,
} from './affinity';

export const toPlainObject = model => {
    const g = getFromModel(model);
    const list = g('requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms', []);
    return list.map(t => ({
        rules: resolveLableSelector(t.matchExpressions || [], true).sort(a => (a.disabled ? -1 : 1)),
    }));
};

export const toK8SObject = nodeSelectorTerms => {
    if (nodeSelectorTerms.length) {
        const t = [];
        nodeSelectorTerms.forEach(term => {
            const matchFields = term.rules;
            const r = refactLableSelector(matchFields);
            if (r.length) {
                t.push({
                    matchExpressions: r,
                });
            }
        });
        if (t.length === 0) return null;
        return {
            requiredDuringSchedulingIgnoredDuringExecution: {
                nodeSelectorTerms: t,
            },
        };
    }
    return null;
};
