import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
    toPatchObject as toPatchConfigObject,
} from '../base/config';

import { getFromModel } from '../base/utils';


export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        spec: {
            rule: {
                expr: g('spec.groups[0].rules[0].expr'),
                severity: g('spec.groups[0].rules[0].labels.severity', 'info'),
                ams: g('spec.groups[0].name'),
            },
        },
    };
}

export function toK8SObject(model) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'monitoring.coreos.com/v1',
        'PrometheusRule',
        model
    );
    obj.metadata.labels['kubecube.io/owner'] = g('spec.rule.ams');
    return {
        ...obj,
        spec: {
            groups: [{
                name: g('spec.rule.ams'),
                rules: [{
                    alert: g('metadata.name'),
                    expr: g('spec.rule.expr'),
                    labels: {
                        severity: g('spec.rule.severity'),
                        kubecube_io_owner: g('spec.rule.ams'),
                    },
                }],
            }],
        },
    };
}

export function patchK8SObject(model, tenant, project) {
    const obj = toPatchConfigObject(model);
    const newK8SObject = toK8SObject(model, tenant, project);
    obj.metadata.labels['kubecube.io/owner'] = newK8SObject.metadata.labels['kubecube.io/owner'];
    return {
        ...obj,
        spec: newK8SObject.spec,
    };
}
