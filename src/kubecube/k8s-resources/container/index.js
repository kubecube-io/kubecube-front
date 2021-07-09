import {
    getFromModel,
    isFilledObject,
} from '../base';
import {
    pick,
    zipObjectDeep,
    toNumber,
    concat,
    flatten,
    get,
    cloneDeep,
} from 'lodash';
import { unitConvert } from 'kubecube/utils/functional';
import { RESOURCE_REQUEST_MAP } from 'kubecube/utils/constance';
import {
    toPlainObject as toStatusPlainObject,
} from './status';
let uniqueid = 1;

function resolveEnv(env) {
    const obj = {
        value: [],
        secretKeyRef: [],
        configMapKeyRef: [],
        fieldRef: [],
        resourceFieldRef: [],
    };
    env.forEach(i => {
        const c = getFromModel(i);
        const name = c('name');
        const valueFrom = c('valueFrom');

        if (!valueFrom) {
            obj.value.push({ key: name, value: c('value') });
        } else {
            if (valueFrom.configMapKeyRef) {
                const { key, value } = valueFrom.configMapKeyRef;
                obj.configMapKeyRef.push({ key: name, configmap: key, configmapKey: value });
            }
            if (valueFrom.fieldRef) {
                const { fieldPath } = valueFrom.fieldRef;
                obj.fieldRef.push({ key: name, field: fieldPath });
            }
            if (valueFrom.resourceFieldRef) {
                const { containerName, resource } = valueFrom.resourceFieldRef;
                obj.resourceFieldRef.push({ key: name, resource: containerName, resoueceKey: resource });
            }
            if (valueFrom.secretKeyRef) {
                const { key, name } = valueFrom.secretKeyRef;
                obj.secretKeyRef.push({ key: name, secret: key, secretKey: name });
            }
        }
    });
    return obj;
}

const refactEnv = envModel => {
    return concat(
        envModel.value.filter(isFilledObject).map(o => ({
            name: o.key,
            value: o.value,
        })),
        envModel.secretKeyRef.filter(isFilledObject).map(o => ({
            name: o.key,
            valueFrom: {
                secretKeyRef: {
                    key: o.secret, name: o.secretKey,
                },
            },
        })),
        envModel.configMapKeyRef.filter(isFilledObject).map(o => ({
            name: o.key,
            valueFrom: {
                configMapKeyRef: {
                    key: o.configmap, name: o.configmapKey,
                },
            },
        })),
        envModel.fieldRef.filter(isFilledObject).map(o => ({
            name: o.key,
            valueFrom: {
                fieldRef: {
                    fieldPath: o.field,
                },
            },
        })),
        envModel.resourceFieldRef.filter(isFilledObject).map(o => ({
            name: o.key,
            valueFrom: {
                resourceFieldRef: {
                    containerName: o.resource, resource: o.resoueceKey,
                },
            },
        }))
    );
};

const resolveLifeCycle = lifecycle => {

    const obj = {
        enable: false,
        method: 'exec',
        command: '',
        host: '',
        path: '',
        port: 1,
        httpHeaders: [],
    };
    if (!lifecycle) return obj;
    if (lifecycle.exec) {
        obj.enable = true;
        obj.command = lifecycle.exec.command.join('\n');
    } else if (lifecycle.httpGet) {
        obj.enable = true;
        obj.method = 'httpGet';
        Object.assign(obj, lifecycle.httpGet);

    } else if (lifecycle.tcpSocket) {
        obj.enable = true;
        obj.method = 'tcpSocket';
        Object.assign(obj, lifecycle.tcpSocket);
    }
    return obj;
};

const refactLifeCycle = lifecycleModel => {
    if (!lifecycleModel.enable) return null;
    switch (lifecycleModel.method) {
        case 'exec':
            return {
                exec: {
                    command: lifecycleModel.command.split('\n'),
                },
            };
        case 'httpGet':
            return {
                httpGet: {
                    host: lifecycleModel.host,
                    path: lifecycleModel.path,
                    port: toNumber(lifecycleModel.port),
                    httpHeaders: lifecycleModel.httpHeaders.filter(h => h.name && h.value),
                },
            };
        case 'tcpSocket':
            return {
                tcpSocket: {
                    host: lifecycleModel.host,
                    port: toNumber(lifecycleModel.port),
                },
            };
        default:
            return null;
    }
};

const resolveProbe = probe => {
    const obj = {
        enable: false,
        failureThreshold: 1,
        successThreshold: 1,
        initialDelaySeconds: 0,
        periodSeconds: 10,
        timeoutSeconds: 1,
        method: 'exec',
        command: '',
        host: '',
        path: '',
        port: 0,
        httpHeaders: [],
    };
    if (!probe) {
        return obj;
    }
    const life = resolveLifeCycle(probe);
    Object.assign(obj, life);
    Object.assign(obj, pick(probe, [
        'failureThreshold',
        'initialDelaySeconds',
        'periodSeconds',
        'successThreshold',
        'timeoutSeconds',
    ]));
    return obj;
};

const refactProbe = probeModel => {
    if (!probeModel.enable) return null;
    const g = getFromModel(probeModel);
    return {
        ...refactLifeCycle(probeModel),
        failureThreshold: toNumber(g('failureThreshold')),
        initialDelaySeconds: toNumber(g('initialDelaySeconds')),
        periodSeconds: toNumber(g('periodSeconds')),
        successThreshold: toNumber(g('successThreshold')),
        timeoutSeconds: toNumber(g('timeoutSeconds')),
    };
};

const resolveContainerPorts = ports => {
    const obj = {
        enable: false,
        configs: [],
    };
    if (!ports) {
        return obj;
    }
    obj.configs = ports.map(p => pick(p, [
        'containerPort',
        'name',
        'protocol',
    ]));
    obj.enable = true;
    return obj;
};

const refactPorts = portsModel => {
    if (!portsModel.enable) return null;

    return portsModel.configs.slice();
};

const resolveResource = resource => {
    const obj = {
        type: 0,
        cpu: 0.1,
        gpu: 0,
        memory: 128,
        multiple: 1,
    };
    if (!resource) {
        return obj;
    }
    const g = getFromModel(resource);
    obj.cpu = unitConvert(g('requests.cpu'), 'cpu');
    obj.memory = unitConvert(g('requests.memory'));
    obj.gpu = g('limits["nvidia.com/gpu"]'); // TODO
    obj.type = RESOURCE_REQUEST_MAP.findIndex(item => item.cpu === obj.cpu && item.memory === obj.memory);
    obj.multiple = Math.round(unitConvert(g('limits.cpu'), 'cpu') / obj.cpu) || 1;
    return obj;
};

const refactResouce = resourceModel => {
    const cpu = toNumber(resourceModel.cpu);
    const memory = toNumber(resourceModel.memory);
    // const gpu = toNumber(resourceModel.gpu);
    const multiple = toNumber(resourceModel.multiple);
    return {
        limits: { cpu: `${cpu * multiple * 1000}m`, memory: `${memory * multiple}Mi` },
        requests: { cpu: `${cpu * 1000}m`, memory: `${memory}Mi` },
    };
};

const resolveVolumes = (volumeMounts, volumes) => {
    const obj = {
        pvc: [],
        configmap: [],
        secret: [],
        emptyDir: [],
        hostpath: [],
        vct: [],
        // otherVolume: [],
    };
    const mapping = {
        emptyDir: 'emptyDir',
        'persistentVolumeClaim.claimName': 'pvc',
        'secret.secretName': 'secret',
        'configMap.name': 'configmap',
        hostPath: 'hostpath',
        volumeClaimTemplate: 'vct',
    };
    const vnames = [];
    if (volumeMounts.length && volumes.length) {
        volumeMounts // .filter(i => i.name.startsWith('data-volume'))
            .forEach(i => {
                const volume = volumes.find(v => v.name === i.name);
                let key;
                let resource;
                for (key in mapping) {
                    resource = get(volume, key);
                    if (resource) break;
                }
                if (!resource) return;
                const type = mapping[key];
                switch (type) {
                    case 'pvc':
                    case 'secret':
                    case 'configmap':
                        vnames.push(i.name);
                        obj[type].push({
                            resource,
                            ...pick(i, [ 'mountPath', 'subPath' ]),
                        });
                        break;
                    case 'hostpath':
                        vnames.push(i.name);
                        obj.hostpath.push({
                            pathType: resource.type,
                            mountPath: get(i, 'mountPath'),
                            path: resource.path,
                        });
                        break;
                    default:
                        break;
                }

            });
    }
    if (volumes.length) {
        const emptyDirVolumns = volumes.filter(v => v.emptyDir);
        if (emptyDirVolumns.length) {
            const emname = emptyDirVolumns.map(e => e.name);
            volumeMounts.forEach(i => {
                if (emname.includes(i.name)) {
                    vnames.push(i.name);
                    obj.emptyDir.push({
                        resource: i.name,
                        ...pick(i, [ 'mountPath', 'readOnly' ]),
                    });
                }
            });
        }
    }
    // volumeMounts.forEach(v => {
    //     if (!vnames.includes(v.name)) {
    //         obj.otherVolume.push(v);
    //     }
    // });
    return obj;
};

// Name字段统一格式String.format(data-volume-%s-%d, 容器名字, index.getAndIncrement());
const volumeNameGenerator = containerName => {
    let i = 0;
    // return () => `data-volume-${containerName}-${i++}`;
    return () => `${containerName}-${i++}`;
};

const refactVolumes = (
    volumeMountsModel,
    containerName,
    podVolumes,
    podVolumesYaml
) => {
    const {
        pvc, configmap, secret, emptyDir, hostpath, vct,
        // otherVolume,
    } = volumeMountsModel;
    const getVolumeName = volumeNameGenerator(containerName);
    const volumeMounts = [];
    pvc.filter(p => p.mountPath && p.resource).forEach(p => {
        const exsit = podVolumesYaml.persistentVolumeClaim.find(pvc => pvc.persistentVolumeClaim.claimName === p.resource);
        const name = exsit ? exsit.name : getVolumeName();

        podVolumesYaml.persistentVolumeClaim.push({
            name,
            persistentVolumeClaim: {
                claimName: p.resource,
                readOnly: false,
            },
        });
        volumeMounts.push({
            name,
            readOnly: false,
            ...pick(p, [ 'mountPath', 'subPath' ]),
        });
    });

    configmap.filter(p => p.mountPath && p.resource).forEach(p => {
        const name = getVolumeName();
        podVolumesYaml.configMap.push({
            name,
            configMap: {
                name: p.resource,
                defaultMode: 420,
                optional: false,
            },
        });
        volumeMounts.push({
            name,
            readOnly: true,
            ...pick(p, [ 'mountPath', 'subPath' ]),
        });
    });

    secret.filter(p => p.mountPath && p.resource).forEach(p => {
        const name = getVolumeName();
        podVolumesYaml.secret.push({
            name,
            secret: {
                secretName: p.resource,
                defaultMode: 420,
                optional: false,
            },
        });
        volumeMounts.push({
            name,
            readOnly: true,
            ...pick(p, [ 'mountPath', 'subPath' ]),
        });
    });

    emptyDir.filter(p => {
        const dir = podVolumes.emptyDir.find(dir => dir.name === p.resource);
        return dir && p.resource && p.mountPath;
    }).forEach(p => {
        const dir = podVolumes.emptyDir.find(dir => dir.name === p.resource);
        const name = dir.name;
        podVolumesYaml.emptyDir.push({
            name,
            emptyDir: {
                medium: dir.medium,
                sizeLimit: dir.sizeLimit,
            },
        });
        volumeMounts.push({
            name,
            readOnly: p.readOnly,
            mountPath: p.mountPath,
        });
    });

    hostpath.filter(p => p.path && p.mountPath).forEach(p => {
        const name = getVolumeName();
        podVolumesYaml.hostPath.push({
            name,
            hostPath: {
                type: p.pathType,
                path: p.path,
            },
        });
        volumeMounts.push({
            name,
            readOnly: false,
            mountPath: p.mountPath,
        });
    });
    vct.filter(p => p.name && p.mountPath).forEach(p => {
        volumeMounts.push({
            name: p.name,
            mountPath: p.mountPath,
        });
    });
    // volumeMounts = volumeMounts.concat(otherVolume);
    return volumeMounts;
};

// const resolveLogs = volumeMounts => {
//     const logs = [];
//     if (volumeMounts.length) {
//         volumeMounts.filter(i => i.name.startsWith('log-volume')).forEach(p => {
//             logs.push({
//                 path: p.mountPath,
//             });
//         });
//     }
//     return logs;
// };

// const logNameGenerator = containerName => {
//     const i = 0;
//     return () => `log-volume-${containerName}-${i}`;
// };
// const refactLogs = (log, containerName, podVolumesYaml) => {

//     const logs = log.filter(l => l.path.trim());
//     if (log.length === 0) return null;
//     const volumeMounts = [];
//     const volumes = [];
//     const getVolumeName = logNameGenerator(containerName);
//     logs.forEach(({ path }) => {
//         const name = getVolumeName();
//         volumeMounts.push({
//             mountPath: path,
//             name,
//             readOnly: false,
//         });
//         volumes.push({
//             hostPath: {
//                 path: '', // TODO
//                 type: 'DirectoryOrCreate',
//             },
//             name,
//         });
//     });
//     podVolumesYaml.log = volumes;
//     return volumeMounts;
// };

export const resolveContainer = (c, type, volumes, workload) => {
    const cg = getFromModel(c);
    const container = {
        type,
        containerName: cg('name'),
        args: cg('args', []).join('\n'),
        command: cg('command', []).join('\n'),
        env: resolveEnv(cg('env', [])),
        image: cg('image'),
        imagePullPolicy: cg('imagePullPolicy'),
        // log: resolveLogs(cg('volumeMounts', [])),
        probe: {
            postStart: resolveLifeCycle(cg('lifecycle.postStart')),
            preStop: resolveLifeCycle(cg('lifecycle.preStop')),
            liveness: resolveProbe(cg('livenessProbe', null)),
            readiness: resolveProbe(cg('readinessProbe', null)),
        },
        ports: resolveContainerPorts(cg('ports', null)),
        resources: resolveResource(cg('resources', null)),
        volumes: resolveVolumes(cg('volumeMounts', []), volumes),
        uniqueid: uniqueid++,
        status: toStatusPlainObject(workload, cg('name')),
        raw: cloneDeep(c),
    };

    container.showAdvanced =
        container.args.length > 0 ||
        container.command.length > 0 ||
        flatten(Object.values(container.env)).length > 0 ||
        Object.values(container.probe).some(p => p.enable) ||
        container.ports.enable ||
        flatten(Object.values(container.volumes)).length > 0;
    return container;
};

export const toPlainObject = (model, workload) => {
    const g = getFromModel(model);
    const containers = g('containers', []);
    const initContainers = g('initContainers', []);
    const volumes = g('volumes', []);
    const nc = containers.map(c => resolveContainer(c, 'normal', volumes, workload));
    const initc = initContainers.map(c => resolveContainer(c, 'init', volumes, workload));
    return nc.concat(initc);
};

export const refactContainer = (c, podVolumes, podVolumesYaml) => {
    const cg = getFromModel(c);
    const container = zipObjectDeep([
        'name',
        'args',
        'command',
        'env',
        'image',
        'imagePullPolicy',
        'lifecycle.postStart',
        'lifecycle.preStop',
        'livenessProbe',
        'readinessProbe',
        'ports',
        'resources',
        'volumeMounts',
    ], [
        cg('containerName'),
        cg('args').split('\n').filter(i => i),
        cg('command').split('\n').filter(i => i),
        refactEnv(cg('env')),
        cg('image'),
        cg('imagePullPolicy'),
        refactLifeCycle(cg('probe.postStart')),
        refactLifeCycle(cg('probe.preStop')),
        refactProbe(cg('probe.liveness')),
        refactProbe(cg('probe.readiness')),
        refactPorts(cg('ports')),
        refactResouce(cg('resources')),
        refactVolumes(cg('volumes'), cg('containerName'), podVolumes, podVolumesYaml),
    ]);
    // const logVolumns = refactLogs(cg('log', []), cg('containerName'), podVolumesYaml);
    // if (logVolumns) container.volumeMounts = container.volumeMounts.concat(logVolumns);
    return container;
};


export const toK8SObject = model => {
    const cg = getFromModel(model);
    const podVolumes = cg('podTemplate.spec.volumes');
    const containers = [];
    const initContainers = [];
    const podVolumesYaml = {
        persistentVolumeClaim: [],
        configMap: [],
        secret: [],
        emptyDir: [],
        hostPath: [],
    };
    cg('containers', []).forEach(c => {
        if (c.type === 'normal') {
            containers.push(refactContainer(c, podVolumes, podVolumesYaml));
        }
        if (c.type === 'init') {
            initContainers.push(refactContainer(c, podVolumes, podVolumesYaml));
        }
    });
    return {
        containers,
        initContainers,
        volumes: flatten(Object.values(podVolumesYaml)),
    };

};


export const getDefaultContainer = () => ({
    containerName: '',
    type: 'normal',
    image: '',
    imagePullPolicy: 'Always',
    resources: {
        type: 0,
        cpu: 0.1,
        gpu: 0,
        memory: 128,
        multiple: 1,
    },
    volumes: {
        pvc: [],
        configmap: [],
        secret: [],
        emptyDir: [],
        hostpath: [],
        vct: [],
        // otherVolume: [],
    },
    log: [],
    env: {
        value: [],
        secretKeyRef: [],
        configMapKeyRef: [],
        fieldRef: [],
        resourceFieldRef: [],
    },
    command: '',
    args: '',
    probe: {
        liveness: {
            enable: false,
            failureThreshold: 1,
            successThreshold: 1,
            initialDelaySeconds: 0,
            periodSeconds: 10,
            timeoutSeconds: 1,
            method: 'exec',
            command: '',
            host: '',
            path: '',
            port: 1,
            httpHeaders: [],
        },
        readiness: {
            enable: false,
            failureThreshold: 1,
            successThreshold: 1,
            initialDelaySeconds: 0,
            periodSeconds: 10,
            timeoutSeconds: 1,
            method: 'exec',
            command: '',
            host: '',
            path: '',
            port: 1,
            httpHeaders: [],
        },
        preStop: {
            enable: false,
            method: 'exec',
            command: '',
            host: '',
            path: '',
            port: 1,
            httpHeaders: [],
        },
        postStart: {
            enable: false,
            method: 'exec',
            command: '',
            host: '',
            path: '',
            port: 1,
            httpHeaders: [],
        },
    },
    ports: {
        enable: false,
        configs: [],
    },
    uniqueid: uniqueid++,
    showAdvanced: false,
});
