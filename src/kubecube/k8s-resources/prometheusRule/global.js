import { merge, get, omit } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
    toPatchObject as toPatchConfigObject,
} from '../base/config';

import { getFromModel, KVtoObject, toObjectArray } from '../base/utils';
export const RESOURCE = {
    namespace: 'kubecube-monitoring',
    group: 'monitoring.coreos.com',
    version: 'v1',
    plural: 'prometheusrules',
};

export const CRITICALS = [
    { text: '轻微', value: 'info' },
    { text: '一般', value: 'warning' },
    { text: '紧急', value: 'critical' },
];

export function getDefaultRule() {
    return {
        hideAdvanced: false,
        expr: '',
        for: '',
        severity: 'info',
        summary: '',
        description: '',
        runbook_url: '',
        labels: [],
        annotations: [],
    };
}

function resolveRules(rules) {
    return rules.map(r => {
        const defaultRule = getDefaultRule(r);
        merge(defaultRule, r);
        defaultRule.summary = get(r, 'annotations.summary');
        defaultRule.description = get(r, 'annotations.description');
        defaultRule.runbook_url = get(r, 'annotations.runbook_url');
        defaultRule.severity = get(r, 'labels.severity');
        defaultRule.labels = toObjectArray(omit(get(r, 'labels', []), [ 'severity' ]), 'key', 'value');
        defaultRule.annotations = toObjectArray(omit(get(r, 'annotations', []), [ 'summary', 'description', 'runbook_url' ]), 'key', 'value');
        defaultRule.hideAdvanced = Object.values(defaultRule).some(v => {
            if (typeof v === 'undefined') {
                return true;
            }
            if (typeof v === 'string') {
                return !v;
            }
            if (Array.isArray(v)) {
                return v.length === 0;
            }
            return false;
        });
        return defaultRule;
    });
}

export function getDefaultGroup() {
    return {
        name: '',
        rules: [],
    };
}

function resolveGroups(groups) {
    return groups.map(g => ({
        name: g.name,
        rules: resolveRules(g.rules),
    }));
}

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        spec: {
            groups: resolveGroups(g('spec.groups') || []),
        },
    };
}

function refactRule(rule, name) {
    const {
        expr,
        for: forLiteral,
        severity,
        summary,
        description,
        runbook_url,
        labels,
        annotations,
    } = rule;

    const obj = {
        alert: name,
        expr,
        label: {
            severity,
            ...KVtoObject(labels.filter(l => l.key), 'key', 'value'),
        },
        annotations: {
            summary,
            description,
            runbook_url,
            ...KVtoObject(annotations.filter(l => l.key), 'key', 'value'),
        },
    };
    if (forLiteral) {
        obj.for = forLiteral;
    }
    return obj;
}

function refactGroup(groups, name) {
    return groups.map(g => ({
        name: g.name,
        rules: g.rules.map(r => refactRule(r, name)),
    }));
}

export function toK8SObject(model) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'monitoring.coreos.com/v1',
        'PrometheusRule',
        model
    );
    obj.metadata.labels['kubecube.io/owner'] = 'platform';
    return {
        ...obj,
        spec: {
            groups: refactGroup(g('spec.groups'), g('metadata.name')),
        },
    };
}

export function patchK8SObject(model) {
    const newK8SObject = toK8SObject(model);
    return {
        spec: {
            groups: newK8SObject.spec.groups,
        },
    };
}
