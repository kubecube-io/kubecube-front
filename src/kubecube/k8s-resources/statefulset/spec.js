import {
    toNumber,
    get,
} from 'lodash';

import {
    getFromModel,
    genReset,
} from '../base/utils';

// import {
//     toPlainObject as toMetadataPlainObject,
//     toK8SObject as toMetadataK8SObject,
// } from '../metadata';

import {
    toPlainObject as toSelectorPlainObject,
} from '../label-selector';

const resolveVC = model => {
    const g = getFromModel(model);
    const vct = g('spec.volumeClaimTemplates', []);
    const obj = {
        enable: vct.length > 0,
        templates: vct.map(t => {
            const gc = getFromModel(t);
            return {
                accessModes: gc('spec.accessModes')[0],
                storageClassName: gc('spec.storageClassName'),
                name: gc('metadata.name'),
                storage: /^(\d+)/.exec(gc('spec.resources.requests.storage', '1Gi'))[1],
            };
        }),
    };
    return obj;
};

export const toPlainObject = (model, container) => {
    const g = getFromModel(model);
    const volumeClaimTemplates = resolveVC(model);
    if (volumeClaimTemplates.enable) {
        container.forEach(c => {
            const volumeMountsRaw = get(c.raw, 'volumeMounts', []);

            volumeClaimTemplates.templates.forEach(vct => {
                const vctname = vct.name;
                const vmount = volumeMountsRaw.find(vm => vm.name === vctname);
                if (vmount) {
                    c.volumes.vct.push({
                        name: vmount.name,
                        mountPath: vmount.mountPath,
                    });
                    c.showAdvanced = true;
                }
            });
        });
    }

    return {
        // ...pickBy(g('spec'), v => !isObjectLike(v)),
        serviceName: g('spec.serviceName'),
        replicas: g('spec.replicas', 1),
        volumeClaimTemplates,
        ...toSelectorPlainObject(g('spec')),
    };
};

const refactVCT = model => {
    if (model.spec.volumeClaimTemplates.enable) {
        return model.spec.volumeClaimTemplates.templates.map(v => ({
            metadata: {
                name: v.name,
            },
            spec: {
                storageClassName: v.storageClassName,
                resources: {
                    requests: {
                        storage: `${v.storage}Gi`,
                    },
                },
                accessModes: [ v.accessModes ],
            },
        }));
    }
    return null;
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    const obj = {
        replicas: toNumber(g('spec.replicas')),
        serviceName: g('spec.serviceName'),
    };

    const vcts = refactVCT(model);
    if (vcts) {
        obj.volumeClaimTemplates = vcts;
    }
    return obj;
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.replicas');
    resetProperty('spec.serviceName');
    resetProperty('spec.volumeClaimTemplates');
};
