import { get } from 'lodash';
import {
    getFromModel,
} from '../base';
import {
    resolveLableSelector,
    refactLableSelector,
} from './affinity';

export const toPlainObject = model => {
    const g = getFromModel(model);
    const list = g('requiredDuringSchedulingIgnoredDuringExecution', []);
    // list === PodAffinityTerm<array>
    return list.map(t => ({
        rules: resolveLableSelector(get(t, 'labelSelector.matchExpressions', [])),
        namespaces: t.namespace,
        namespace: get(t, 'namespaces[0]', ''),
        topologyKey: t.topologyKey,
    }));
};


export const toK8SObject = PodAffinityTerm => {
    if (PodAffinityTerm.length) {
        const t = [];
        PodAffinityTerm.forEach(term => {
            const labelSelector = term.rules;
            const r = refactLableSelector(labelSelector);
            if (r.length) {
                t.push({
                    labelSelector: {
                        matchExpressions: r,
                    },
                    namespaces: [ term.namespace ],
                    topologyKey: term.topologyKey,
                });
            }
        });
        if (t.length === 0) return null;
        return {
            requiredDuringSchedulingIgnoredDuringExecution: t,
        };
    }
    return null;
};
