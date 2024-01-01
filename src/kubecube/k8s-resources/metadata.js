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
        name: g('metadata.name'), // 名称
        clusterName: g('metadata.clusterName'), // 所在集群名
        namespace: g('metadata.namespace'), // 所在命名空间
        annotations: toObjectArray(g('metadata.annotations', {}), 'key', 'value'), // 注释
        labels: toObjectArray(g('metadata.labels', {}), 'key', 'value').map(i => ({ // 标签
            ...i,
            disabled: ignoredKeys.some(k => k.test(i.key)),
        })).sort((a, b) => (a.disabled ? -1 : 1)),
        pureLabels: g('metadata.labels', {}), // 原始标签
        resourceVersion: g('metadata.resourceVersion'), // 资源版本
        creationTimestamp: g('metadata.creationTimestamp'), // 创建时间
        deletionTimestamp: g('metadata.deletionTimestamp'), // 删除时间
        ownerReferences: g('metadata.ownerReferences'), // 属主信息
        uid: g('metadata.uid'), // uid
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

export function toModifyObject(model) {
    const pureSourceMetadata = model.puresource.metadata;
    const newK8SSpecObject = toK8SObject(model);
    const remains = omit(pureSourceMetadata, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}
