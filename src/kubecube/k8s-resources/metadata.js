import {
    omitBy,
    isEmpty,
    zipObjectDeep,
    omit,
} from 'lodash';
import {
    getFromModel,
    toObjectArray,
    KVtoObject,
} from './base';
import { ignoredKeys } from 'kubecube/utils/constance';

export const toPlainObject = (model, mode = 'normal') => {
    const g = getFromModel(model);
    const obj = {
        name: g('metadata.name'),
        clusterName: g('metadata.clusterName'),
        namespace: g('metadata.namespace'),
        annotations: toObjectArray(g('metadata.annotations', {}), 'key', 'value'),
        labels: toObjectArray(g('metadata.labels', {}), 'key', 'value').map(i => ({
            ...i,
            disabled: ignoredKeys.some(k => i.key.startsWith(k)),
        })),
        pureLabels: g('metadata.labels', {}),
        resourceVersion: g('metadata.resourceVersion'),
        creationTimestamp: g('metadata.creationTimestamp'),
        ownerReferences: g('metadata.ownerReferences'),
        uid: g('metadata.uid'),
    };
    if (mode === 'noEmpty') {
        return omitBy(obj, v => isEmpty(v) || !v);
    }
    return obj;
};

const effectKeys = [
    'name',
    'annotations',
    'labels',
];
export const toK8SObject = model => {
    const g = getFromModel(model);
    return omitBy(zipObjectDeep(effectKeys, [
        g('metadata.name'),
        KVtoObject(g('metadata.annotations'), 'key', 'value'),
        {
            ...KVtoObject(g('metadata.labels'), 'key', 'value'),
            // 'kubecube.io/app': g('metadata.name'),
        },
        // TODO NSF 标签注入
    ]), v => !v);
};

export function toPatchObject(model) {
    const pureSourceMetadata = model.metadata;
    const newK8SSpecObject = toK8SObject(model);
    const remains = omit(pureSourceMetadata, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}
