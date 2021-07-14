import {
    getFromModel,
} from '../base';

import {
    toPlainObject as toMetadataPlainObject,
    // toK8SObject as toMetadataK8SObject,
} from '../metadata';


export const toPlainObject = model => {
    const g = getFromModel(model);
    const tenant = g('metadata.labels["kubecube.io/tenant"]');
    return {
        tenant,
        metadata: {
            ...toMetadataPlainObject(model),
            labels: g('metadata.labels'),
        },
        spec: g('spec', {
            displayName: '',
            description: '',
            namespace: '',
        }),
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    return {
        kind: 'Project',
        apiVersion: 'tenant.kubecube.io/v1',
        metadata: {
            name: g('metadata.name'),
            labels: {
                'kubecube.io/tenant': g('tenant'),
            },
        },
        spec: {
            displayName: g('spec.displayName'),
            description: g('spec.description'),
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
