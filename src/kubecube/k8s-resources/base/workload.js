import { cloneDeep } from 'lodash';
import { getFromModel, genReset } from './utils';

import {
    toPlainObject as toMetadataPlainObject,
    toK8SObject as toMetadataK8SObject,
} from '../metadata';

import {
    toPlainObject as toPodTemplatePlainObject,
} from '../pod/pod-template';

import {
    toK8SObject as toPodSpecK8SObject,
} from '../pod/pod-spec';

import {
    toPlainObject as toContainerPlainObject,
    toK8SObject as toContainerK8SObject,
} from '../container';

export function toPlainObject(model) {
    const g = getFromModel(model);
    return ({
        toSpecPlainObject,
        toStatusPlainObject,
        podTemplatePath = 'spec.template',
        containerPath = 'spec.template.spec',
    }) => {
        const podTemplate = toPodTemplatePlainObject(g(podTemplatePath));
        const containers = toContainerPlainObject(g(containerPath), model);
        const obj = {
            apiVersion: g('apiVersion'),
            kind: g('kind'),
            spec: toSpecPlainObject(model, containers, podTemplate),
            metadata: toMetadataPlainObject(model, containers, podTemplate),
            podTemplate,
            containers,
            status: toStatusPlainObject(model, containers, podTemplate),
            podStatus: g('podStatus') || {},
            puresource: Object.freeze(cloneDeep(model)),
        };
        // Object.defineProperty(obj, 'puresource', {
        //     value: ,
        //     writable: false,
        //     configurable: false,
        // });
        return obj;
    };
}

export function toK8SObject(model) {
    return ({
        apiVersion,
        kind,
        toSpecK8SObject,
    }) => {

        const metadata = toMetadataK8SObject(model);
        const labels = {
            'kubecube.io/app': metadata.name,
        };
        Object.assign(metadata.labels, labels);

        const podMetadata = toMetadataK8SObject(model.podTemplate);
        Object.assign(podMetadata.labels, labels);

        const podSpec = toPodSpecK8SObject(model);
        const {
            containers,
            initContainers,
            volumes,
        } = toContainerK8SObject(model);
        podSpec.volumes = volumes.concat(podSpec.volumes);

        const obj = {
            apiVersion,
            kind,
            metadata,
            spec: {
                selector: {
                    matchLabels: labels,
                },
                template: {
                    metadata: podMetadata,
                    spec: {
                        containers,
                        initContainers,
                        ...podSpec,
                    },
                },
            },
        };
        Object.assign(obj.spec, toSpecK8SObject(model, metadata, obj));
        return obj;
    };
}

export function toModifyK8SObject(model) {
    return ({
        apiVersion,
        kind,
        toSpecK8SObject,
        toModifyK8SObject,
        podTemplatePath = 'spec.template',
    }) => {
        const puresource = model.puresource;
        const newObject = toK8SObject(model)({
            apiVersion,
            kind,
            toSpecK8SObject,
        });
        const target = cloneDeep(puresource);

        toModifyK8SObject(target, newObject);

        const resetProperty = genReset(target, newObject);

        resetProperty(`${podTemplatePath}.metadata.labels`);
        resetProperty(`${podTemplatePath}.metadata.annotations`);
        resetProperty(`${podTemplatePath}.spec.restartPolicy`);
        resetProperty(`${podTemplatePath}.spec.containers`);
        resetProperty(`${podTemplatePath}.spec.initContainers`);
        resetProperty(`${podTemplatePath}.spec.imagePullSecrets`);
        resetProperty(`${podTemplatePath}.spec.affinity`);
        resetProperty(`${podTemplatePath}.spec.tolerations`);
        resetProperty(`${podTemplatePath}.spec.volumes`);
        return target;
    };
}
