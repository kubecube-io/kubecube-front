import {
    getFromModel,
} from '../base';

import {
    toPlainObject as toMetadataPlainObject,
    // toK8SObject as toMetadataK8SObject,
} from '../metadata';


export const toPlainObject = model => {
    const g = getFromModel(model);

    return {
        metadata: toMetadataPlainObject(model),
        spec: g('spec', {
            description: '',
            displayName: '',
            namespace: '',
        }),
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    return {
        kind: 'Tenant',
        apiVersion: 'tenant.kubecube.io/v1',
        metadata: {
            name: g('metadata.name'),
        },
        spec: {
            displayName: g('spec.displayName'),
        },
    };
};

export const toPatchObject = model => {
    const g = getFromModel(model);
    return {
        spec: {
            displayName: g('spec.displayName'),
        },
    };
};
