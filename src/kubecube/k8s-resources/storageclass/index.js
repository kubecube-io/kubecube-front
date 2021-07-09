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
