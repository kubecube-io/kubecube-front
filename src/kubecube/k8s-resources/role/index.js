import { get, uniq } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
} from '../base/config';
import { getFromModel } from '../base/utils';
import {
    RESOURCE_AUTH_MAP,
    RESOURCE_RIGHTS,
    RESOURCE_CONVERT_AUTH_MAP,
} from 'kubecube/utils/constance';
const resource_mapping = {};
function resolveRules(rules, ruleTemplate) {
    const isTemplate = typeof ruleTemplate === 'boolean' && ruleTemplate;

    const resolvedRules = rules.map(r => {
        if (isTemplate) {
            r.resources.forEach(r => {
                const key = get(r.split('/'), '[0]');
                if (!resource_mapping[key]) resource_mapping[key] = [];
                if (!resource_mapping[key].includes(r)) resource_mapping[key].push(r);
            });
        }
        return {
            resources: uniq(r.resources.map(resource => get(resource.split('/'), '[0]'))),
            rights: uniq(r.verbs.map(right => RESOURCE_AUTH_MAP[right])),
        };
    });
    console.log(resource_mapping);
    const obj = {};
    resolvedRules.forEach(rule => {
        const { resources, rights } = rule;
        const read = rights.includes(RESOURCE_RIGHTS.READ);
        const write = rights.includes(RESOURCE_RIGHTS.WRITE);
        resources.forEach(r => {
            if (!obj[r]) {
                obj[r] = {
                    [RESOURCE_RIGHTS.READ]: false,
                    [RESOURCE_RIGHTS.WRITE]: false,
                };
            }
            obj[r][RESOURCE_RIGHTS.READ] = (obj[r][RESOURCE_RIGHTS.READ] || read);
            obj[r][RESOURCE_RIGHTS.WRITE] = (obj[r][RESOURCE_RIGHTS.READ] || write);
        });
    });
    console.log(!isTemplate && ruleTemplate);
    if (!isTemplate && ruleTemplate) {
        Object.keys(ruleTemplate).forEach(r => {
            if (!obj[r]) {
                obj[r] = {
                    [RESOURCE_RIGHTS.READ]: false,
                    [RESOURCE_RIGHTS.WRITE]: false,
                };
            }
        });
    }

    return obj;
}

function refactRules(rules) {
    const obj = [];
    Object.keys(rules).forEach(r => {
        const currule = rules[r];
        if (currule[RESOURCE_RIGHTS.READ] || currule[RESOURCE_RIGHTS.WRITE]) {
            let verbs = currule[RESOURCE_RIGHTS.READ] ? RESOURCE_CONVERT_AUTH_MAP[RESOURCE_RIGHTS.READ] : [];
            verbs = verbs.concat(currule[RESOURCE_RIGHTS.WRITE] ? RESOURCE_CONVERT_AUTH_MAP[RESOURCE_RIGHTS.WRITE] : []);
            obj.push({
                resources: resource_mapping[r],
                apiGroups: [ '*' ],
                verbs,
            });
        }

    });
    return obj;
}

export function toPlainObject(model, ruleTemplate) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    const rules = resolveRules(g('rules') || [], ruleTemplate);
    return {
        ...obj,
        rules,
    };
}

export function toK8SObject(name, mode, identity, rules) {
    const obj = toConfigK8SObject(
        'rbac.authorization.k8s.io/v1',
        'ClusterRole',
        {
            metadata: {
                name,
                labels: [
                    { key: 'kubecube.io/rbac', value: 'true' },
                    { key: 'kubecube.io/role', value: identity },
                ],
                annotations: [
                    { key: 'kubecube.io/sync', value: 'true' },
                ],
            },
        }
    );

    return {
        ...obj,
        rules,
    };
}


export function patchK8SObject(model) {
    const rules = refactRules(model.rules);
    console.log(rules);
    return {
        rules,
    };
}
