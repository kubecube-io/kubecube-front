import { pickBy, isObjectLike, xorBy } from 'lodash';
import {
    getFromModel,
} from '../base';
import {
    toPlainObject as toMetaPlainObject,
} from '../metadata';

import {
    toPlainObject as toNodeAffinityPlainObject,
    toK8SObject as toNodeAffinityK8SObject,
} from './node-affinity';

import {
    toPlainObject as toPodAffinityPlainObject,
    toK8SObject as toPodAffinityK8SObject,
} from './pod-affinity';
import { resolveToleration, refactToleration } from './toleration';

const resolveVolume = volumes => {
    const obj = {
        persistentVolumeClaim: [],
        configMap: [],
        secret: [],
        emptyDir: [],
        hostPath: [],
        otherVolume: [],
    };
    const types = Object.keys(obj);
    const dataVolume = volumes.filter(v => types.some(t => v[t]));
    dataVolume.forEach(element => {
        const t = types.find(t => element[t]);
        if (t) { obj[t].push(element); }
    });
    const otherVolume = xorBy(dataVolume, volumes, 'name');
    obj.otherVolume = otherVolume;
    return obj;
};

export const toPlainObject = model => {
    const g = getFromModel(model);
    const nodeAffinity = toNodeAffinityPlainObject(g('affinity.nodeAffinity', {}));
    const podAffinity = toPodAffinityPlainObject(g('affinity.podAffinity', {}));
    const podAntiAffinity = toPodAffinityPlainObject(g('affinity.podAntiAffinity', {}));
    const tolerations = resolveToleration(g('tolerations', []));
    const enable = (nodeAffinity.length + podAffinity.length + podAntiAffinity.length + tolerations.length) > 0;

    return {
        ...pickBy(model, v => !isObjectLike(v)),
        ...toMetaPlainObject(g('template', {}), 'noEmpty'),
        activeDeadlineSeconds: g('activeDeadlineSeconds'),
        imagePullSecrets: g('imagePullSecrets', []).map(p => p.name),
        restartPolicy: g('restartPolicy') || 'Always',
        deploymentStrategy: {
            enable,
            nodeAffinity,
            podAffinity,
            podAntiAffinity,
            tolerations,
        },
        volumes: resolveVolume(g('volumes', [])),

    };
};

const setOnExist = function(target, key, p) {
    if (p) target[key] = p;
};

export const toK8SObject = model => {
    const g = getFromModel(model.podTemplate);
    const yaml = {
        imagePullSecrets: g('spec.imagePullSecrets', []),
        volumes: g('spec.volumes.otherVolume', []),
        affinity: {},
        restartPolicy: g('spec.restartPolicy', 'Always'),
    };
    const enabled = g('spec.deploymentStrategy.enable');
    if (!enabled) {
        return yaml;
    }
    const nodeAffinity = toNodeAffinityK8SObject(g('spec.deploymentStrategy.nodeAffinity', []));
    const podAffinity = toPodAffinityK8SObject(g('spec.deploymentStrategy.podAffinity', []));
    const podAntiAffinity = toPodAffinityK8SObject(g('spec.deploymentStrategy.podAntiAffinity', []));
    const tolerations = refactToleration(g('spec.deploymentStrategy.tolerations', []));
    const enableSecond = nodeAffinity || podAffinity || podAntiAffinity || tolerations;
    if (!enableSecond) return yaml;
    setOnExist(yaml.affinity, 'nodeAffinity', nodeAffinity);
    setOnExist(yaml.affinity, 'podAffinity', podAffinity);
    setOnExist(yaml.affinity, 'podAntiAffinity', podAntiAffinity);
    setOnExist(yaml, 'tolerations', tolerations);
    return yaml;
};
