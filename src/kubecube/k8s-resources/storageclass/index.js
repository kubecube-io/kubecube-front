import { pick, zipObjectDeep } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
} from '../base/config';
import { getFromModel } from '../base/utils';

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        allowedTopologies: g('allowedTopologies') || [],
        ...pick(model, [
            'allowVolumeExpansion',
            'provisioner',
            'reclaimPolicy',
            'volumeBindingMode',
            'parameters',
            'mountOptions',
        ]),
    };
}

export function getDefaultModel() {
    return {
        metadata: {
            name: '',
        },
        provisioner: 'kubernetes.io/aws-ebs',
        parameters: { type: '' },
        reclaimPolicy: 'Retain',
        allowVolumeExpansion: true,
        mountOptions: [ 'debug' ],
        volumeBindingMode: 'Immediate',
    };
}

export function toK8SObject(model) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'storage.k8s.io/v1',
        'StorageClass',
        model
    );

    return {
        ...obj,
        ...zipObjectDeep([
            'provisioner',
            'parameters',
            'reclaimPolicy',
            'allowVolumeExpansion',
            'mountOptions',
        ], [
            g('provisioner'),
            g('parameters'),
            g('reclaimPolicy'),
            g('allowVolumeExpansion'),
            g('mountOptions'),
        ]),
    };
}

export function toCephfsK8SObject(model) {
    const g = getFromModel(model);
    const obj = {
        allowVolumeExpansion: true,
        apiVersion: 'storage.k8s.io/v1',
        kind: 'StorageClass',
        metadata: {
            name: g('name'),
        },
        parameters: {
            adminId: g('cephInfo.spec.adminId'),
            adminSecretName: g('cephInfo.spec.adminSecretName'),
            adminSecretNamespace: g('cephInfo.spec.adminSecretNamespace'),
            claimRoot: `/${g('clusterName')}/${g('name')}`, // 集群名称，避免重复
            monitors: g('cephInfo.spec.monitors'),
        },
        provisioner: 'ceph.com/cephfs',
        reclaimPolicy: g('reclaimPolicy'),
        volumeBindingMode: 'Immediate',
    };
    return obj;
}


export function toCephK8SObject(model) {
    const g = getFromModel(model);
    const obj = {
        allowVolumeExpansion: true,
        apiVersion: 'storage.k8s.io/v1',
        kind: 'StorageClass',
        metadata: {
            name: g('name'),
        },
        parameters: {
            adminId: g('cephInfo.spec.adminId'),
            adminSecretName: g('cephInfo.spec.adminSecretName'),
            adminSecretNamespace: g('cephInfo.spec.adminSecretNamespace'),
            fsType: g('fsType'),
            imageFeatures: g('cephInfo.spec.imageFeatures'),
            imageFormat: g('cephInfo.spec.imageFormat'),
            pool: g('cephPool'),
            monitors: g('cephInfo.spec.monitors'),
            userId: g('cephInfo.spec.adminId'),
            userSecretName: g('cephInfo.spec.adminSecretName'),
            userSecretNamespace: g('cephInfo.spec.adminSecretNamespace'),
        },
        provisioner: 'ceph.com/rbd',
        reclaimPolicy: g('reclaimPolicy'),
        volumeBindingMode: 'Immediate',
    };
    return obj;
}

export function toNfsK8SObject(model) {
    const g = getFromModel(model);
    const provisionerInfo = g('provisionerInfo');
    const obj = {
        allowVolumeExpansion: true,
        apiVersion: 'storage.k8s.io/v1',
        kind: 'StorageClass',
        mountOptions: [
            `vers=${provisionerInfo.metadata.labels['system/nfsVersion']}`,
        ],
        metadata: {
            name: g('name'),
        },
        provisioner: g('nfsProvisionerName'),
        reclaimPolicy: g('reclaimPolicy'),
        volumeBindingMode: 'Immediate',
    };
    return obj;
}
