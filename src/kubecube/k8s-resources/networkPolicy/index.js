import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
    toPatchObject as toPatchConfigObject,
} from '../base/config';
import { getFromModel } from '../base/utils';

function combineLabels(label, expression) {
    const lexp = Object.keys(label).map(k => ({
        key: k,
        operator: 'label',
        values: label[k],
    }));
    return [ ...lexp, ...expression ];
}

export function resolveLabelSelector(selector) {
    const g = getFromModel(selector);
    const exps = (g('matchExpressions') || []).map(exp => ({
        ...exp,
        values: exp.values ? exp.values.join(' ') : '',
    }));
    const labels = g('matchLabels') || [];
    return combineLabels(labels, exps);
}
export function refactLabelSelector(selector) {
    const label = {};
    const exps = [];
    selector.forEach(s => {
        if (s.operator === 'label' && s.key && s.values) {
            label[s.key] = s.values;
        }
        if ([ 'In', 'NotIn' ].includes(s.operator) && s.key && s.values) {
            exps.push({
                key: s.key,
                operator: s.operator,
                values: s.values.split(/\s+/),
            });
        }
        if ([ 'Exists', 'DoesNotExist' ].includes(s.operator) && s.key) {
            exps.push({
                key: s.key,
                operator: s.operator,
                values: [],
            });
        }
    });
    return {
        // isEmpty: (Object.keys(label).length === 0 && exps.length === 0),
        matchLabels: label,
        matchExpressions: exps,
    };
}

function resolveNetworkPeer(peer) {
    return peer.map(p => {
        const g = getFromModel(p);
        const ipEnable = !!(g('ipBlock.cidr') || g('ipBlock.except'));
        const nsmatchexp = resolveLabelSelector(g('namespaceSelector') || {});
        const pdmatchexp = resolveLabelSelector(g('podSelector') || {});

        return {
            ipBlock: {
                enable: ipEnable,
                cidr: g('ipBlock.cidr'),
                except: (g('ipBlock.except') || []).map(i => ({ cidr: i })),
            },
            namespaceSelector: {
                enable: nsmatchexp.length > 0,
                disabled: ipEnable,
                matchExpressions: nsmatchexp,
            },
            podSelector: {
                enable: pdmatchexp.length > 0,
                disabled: ipEnable,
                matchExpressions: pdmatchexp,
            },

        };
    });
}

function refactNetworkPeer(peer) {
    return peer.filter(p => (p.ipBlock.enable || p.namespaceSelector.enable || p.podSelector.enable))
        .map(p => {
            if (p.ipBlock.enable) {
                return {
                    ipBlock: {
                        cidr: p.ipBlock.cidr,
                        except: p.ipBlock.except.filter(i => i.cidr).map(i => i.cidr),
                    },
                };
            }
            const selector = {};
            if (p.namespaceSelector.enable) {
                selector.namespaceSelector = refactLabelSelector(p.namespaceSelector.matchExpressions);
            }
            if (p.podSelector.enable) {
                selector.podSelector = refactLabelSelector(p.podSelector.matchExpressions);
            }
            return selector;

        });
}

function resolve2Selection(target) {
    if (Object.keys(target || {}).length > 0) {
        return 'regular';
    }
    return 'all';
}
function resolve2SelectionArray(target) {
    if ((target || []).length > 0) {
        return 'regular';
    }
    return 'all';
}

function resolve3Selection(target, dir, ports) {
    if (!target) return 'none';
    if ((dir || []).length > 0 || (ports || []).length > 0) {
        return 'regular';
    }
    return 'all';
}

function resolveSpec(model) {
    const g = getFromModel(model);
    return {
        ingress: {
            from: resolveNetworkPeer(g('spec.ingress[0].from') || []),
            ports: (g('spec.ingress[0].ports') || []).map(p => ({ ...p, port: +p.port })),
        },
        egress: {
            to: resolveNetworkPeer(g('spec.egress[0].to') || []),
            ports: (g('spec.egress[0].ports') || []).map(p => ({ ...p, port: +p.port })),
        },
        podSelector: resolveLabelSelector(g('spec.podSelector') || {}),

        selections: {
            target: resolve2Selection(g('spec.podSelector')),
            insource: resolve3Selection(g('spec.ingress[0]'), g('spec.ingress[0].from'), g('spec.ingress[0].ports')),
            inport: resolve2SelectionArray(g('spec.ingress[0].ports')),
            outsource: resolve3Selection(g('spec.egress[0]'), g('spec.egress[0].to'), g('spec.egress[0].ports')),
            outport: resolve2SelectionArray(g('spec.egress[0].ports')),
        },
    };
}

function refactPorts(ports) {
    return ports.filter(p => p.port).map(p => ({ ...p, port: +p.port }));
}

function refactSpec(model, selections) {
    const g = getFromModel(model);
    return {
        ingress: selections.insource === 'all' ? [{}]
            : (selections.insource === 'none' ? undefined : [{
                from: refactNetworkPeer(g('spec.ingress.from')),
                ports: selections.inport === 'regular' ? refactPorts(g('spec.ingress.ports')) : [],
            }]),
        egress: selections.outsource === 'all' ? [{}]
            : (selections.outsource === 'none' ? undefined : [{
                to: refactNetworkPeer(g('spec.egress.to')),
                ports: selections.outport === 'regular' ? refactPorts(g('spec.egress.ports')) : [],
            }]),
        podSelector: selections.target === 'all' ? {} : refactLabelSelector(g('spec.podSelector')),
        policyTypes: [ 'Ingress', 'Egress' ],
    };

}

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    return {
        ...obj,
        spec: resolveSpec(model),
    };
}


export function toK8SObject(model, selections) {
    const obj = toConfigK8SObject(
        'networking.k8s.io/v1',
        'NetworkPolicy',
        model
    );

    return {
        ...obj,
        spec: refactSpec(model, selections),
    };
}

export function patchK8SObject(model, selections) {
    const obj = toPatchConfigObject(model);
    const newK8SSpecObject = toK8SObject(model, selections);
    return {
        ...obj,
        spec: newK8SSpecObject.spec,
    };
}
