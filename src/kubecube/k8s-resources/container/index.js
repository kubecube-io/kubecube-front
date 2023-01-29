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
    omit
} from 'lodash';
import { unitConvert } from 'kubecube/utils/functional';
import { RESOURCE_REQUEST_MAP } from 'kubecube/utils/constance';
import store from 'kubecube/store';
import {
    toPlainObject as toStatusPlainObject,
} from './status';
let uniqueid = 1;

function resolveEnv(env) { //环境变量处理
    const obj = {
        value: [],
        secretKeyRef: [],
        configMapKeyRef: [],
        fieldRef: [],
        resourceFieldRef: [],
    };
    env.forEach(i => {
        const c = getFromModel(i);
        const envName = c('name');
        const valueFrom = c('valueFrom');

        if (!valueFrom) {
            obj.value.push({ key: envName, value: c('value') });
        } else {
            if (valueFrom.configMapKeyRef) {
                const { key, name } = valueFrom.configMapKeyRef;
                obj.configMapKeyRef.push({ key: envName, configmap: name, configmapKey: key });
            }
            if (valueFrom.fieldRef) {
                const { fieldPath } = valueFrom.fieldRef;
                obj.fieldRef.push({ key: envName, field: fieldPath });
            }
            if (valueFrom.resourceFieldRef) {
                const { containerName, resource } = valueFrom.resourceFieldRef;
                obj.resourceFieldRef.push({ key: envName, resource: containerName, resoueceKey: resource });
            }
            if (valueFrom.secretKeyRef) {
                const { key, name } = valueFrom.secretKeyRef;
                obj.secretKeyRef.push({ key: envName, secret: name, secretKey: key });
            }
        }
    });
    return obj;
}

const refactEnv = envModel => { //环境变量处理
    return concat(
        envModel.value.filter(isFilledObject).map(o => ({
            name: o.key,
            value: o.value,
        })),
        envModel.secretKeyRef.filter(isFilledObject).map(o => ({
            name: o.key,
            valueFrom: {
                secretKeyRef: {
                    key: o.secretKey, name: o.secret,
                },
            },
        })),
        envModel.configMapKeyRef.filter(isFilledObject).map(o => ({
            name: o.key,
            valueFrom: {
                configMapKeyRef: {
                    key: o.configmapKey, name: o.configmap,
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

const resolveLifeCycle = lifecycle => { // 生命周期执行脚本处理

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
        obj.command = (lifecycle.exec.command || []).join('\n');
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

const refactLifeCycle = lifecycleModel => { // 生命周期执行脚本处理
    if (!lifecycleModel.enable) return null;
    switch (lifecycleModel.method) {
        case 'exec':
            return {
                exec: {
                    command: lifecycleModel.command.split('\n').filter(i => i).map(i => i.replaceAll('\r', '')),
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

const resolveProbe = probe => { // 探针处理
    const obj = {
        enable: false,
        failureThreshold: 3,
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

const refactProbe = probeModel => { // 探针处理
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

const resolveContainerPorts = ports => { // 容器端口处理
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

const refactPorts = portsModel => { // 容器端口处理
    if (!portsModel.enable) return null;

    return portsModel.configs.slice();
};

const resolveResource = resource => { // 容器资源配置处理
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
    obj.gpu = g('limits["nvidia.com/gpu"]', 0); // TODO 扩展其他gpu类型
    obj.type = RESOURCE_REQUEST_MAP.findIndex(item => item.cpu === obj.cpu && item.memory === obj.memory);
    obj.multiple = Math.round(unitConvert(g('limits.cpu'), 'cpu') / obj.cpu) || 1;
    return obj;
};

const refactResouce = resourceModel => { // 容器资源配置处理
    const cpu = toNumber(resourceModel.cpu);
    const memory = toNumber(resourceModel.memory);
    const gpu = toNumber(resourceModel.gpu); // TODO 扩展其他gpu类型
    const multiple = toNumber(resourceModel.multiple);
    return {
        limits: { cpu: `${cpu * multiple * 1000}m`, memory: `${memory * multiple}Mi`, "nvidia.com/gpu": gpu },
        requests: { cpu: `${cpu * 1000}m`, memory: `${memory}Mi` },
    };
};

const resolveVolumes = (volumeMounts, volumes) => { // 挂载数据卷处理
    const obj = {
        pvc: [],
        configmap: [],
        secret: [],
        emptyDir: [],
        hostpath: [],
        vct: [],
        otherVolume: [],
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
    const enablelxcfs = (get(store, 'state.feature.features.enableLxcfs') === true);
    if (volumeMounts.length && volumes.length) {

        volumeMounts.filter(i => (enablelxcfs ? i.name.startsWith('data-volume') : true))
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
                        vnames.push(i.name);
                        obj[type].push({
                            resource,
                            ...pick(i, [ 'mountPath', 'subPath' ]),
                        });
                        break;
                    case 'configmap':
                        vnames.push(i.name);
                        if (volume.configMap.items && volume.configMap.items.length > 0) {
                            volume.configMap.items.forEach(item => {
                                obj[type].push({
                                    resource,
                                    ...pick(i, [ 'mountPath', 'subPath' ]),
                                    key: item.key,
                                    filePath: item.path,
                                });
                            });
                        } else {
                            obj[type].push({
                                resource,
                                ...pick(i, [ 'mountPath', 'subPath' ]),
                                key: '',
                                filePath: '',
                            });
                        }
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
                        mountPath: i.mountPath,
                        readOnly: !!i.readOnly,
                        // ...pick(i, [ 'mountPath', 'readOnly' ]),
                    });
                }
            });
        }
    }
    volumeMounts.forEach(v => {
        if (!vnames.includes(v.name)) {
            const volume = volumes.find(i => v.name === i.name);
            obj.otherVolume.push({
                volumeMounts: v,
                volume,
            });
        }
    });
    return obj;
};

// Name字段统一格式String.format(data-volume-%s-%d, 容器名字, index.getAndIncrement());
const volumeNameGenerator = containerName => {
    let i = 0;
    return () => `data-volume-${containerName}-${i++}`;
    // return () => `${containerName}-${i++}`;
};

const refactVolumes = (
    volumeMountsModel,
    containerName,
    podVolumes,
    podVolumesYaml
) => {
    const {
        pvc, configmap, secret, emptyDir, hostpath, vct,
        otherVolume,
    } = volumeMountsModel;
    const getVolumeName = volumeNameGenerator(containerName);
    const volumeMounts = [];
    pvc.filter(p => p.mountPath && p.resource).forEach(p => {
        const exsit = podVolumesYaml.persistentVolumeClaim.find(pvc => pvc.persistentVolumeClaim.claimName === p.resource);
        const name = exsit ? exsit.name : getVolumeName();
        if(!exsit) {
            podVolumesYaml.persistentVolumeClaim.push({
                name,
                persistentVolumeClaim: {
                    claimName: p.resource,
                    readOnly: false,
                },
            });
        }
        volumeMounts.push({
            name,
            readOnly: false,
            ...pick(p, [ 'mountPath', 'subPath' ]),
        });
    });
    const configMapVolumnsMap = {};
    configmap.filter(p => p.mountPath && p.resource).forEach(p => {
        const key = `${p.resource}-${p.mountPath}`;
        if (!configMapVolumnsMap[key]) {
            configMapVolumnsMap[key] = {
                mountPath: p.mountPath,
                subPath: p.subPath,
                name: p.resource,
                defaultMode: 420,
                optional: false,
                items: [],
            };
        }
        if (p.key) {
            configMapVolumnsMap[key].items.push({
                key: p.key,
                path: p.filePath,
            });
            // 新星item支持subPath
            // configMapVolumnsMap[key].subPath = '';
        }
    });

    Object.values(configMapVolumnsMap).forEach(p => {
        const name = getVolumeName();
        podVolumesYaml.configMap.push({
            name,
            configMap: {
                name: p.name,
                items: p.items,
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
        const exsit = podVolumesYaml.secret.find(item => item.secret.secretName === p.resource);
        const name = exsit ? exsit.name : getVolumeName();
        if (!exsit) {
            podVolumesYaml.secret.push({
                name,
                secret: {
                    secretName: p.resource,
                    defaultMode: 420,
                    optional: false,
                },
            });
        }
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
        const exsit = podVolumesYaml.emptyDir.find(item => item.name === p.resource);
        if (!exsit) {
            podVolumesYaml.emptyDir.push({
                name,
                emptyDir: {
                    medium: dir.medium,
                    sizeLimit: dir.sizeLimit,
                },
            });
        }
        volumeMounts.push({
            name,
            readOnly: p.readOnly,
            mountPath: p.mountPath,
        });
    });

    hostpath.filter(p => p.path && p.mountPath).forEach(p => {
        const exsit = podVolumesYaml.hostPath.find(item => item.hostPath.type === p.pathType && item.hostPath.path === p.path);
        const name = exsit ? exsit.name : getVolumeName();
        if (!exsit) {
            podVolumesYaml.hostPath.push({
                name,
                hostPath: {
                    type: p.pathType,
                    path: p.path,
                },
            });
        }
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
    otherVolume.forEach(p => {
        volumeMounts.push(p.volumeMounts);
        if (!podVolumesYaml.otherVolume.find(v => v.name === p.volume.name)) {
            podVolumesYaml.otherVolume.push(p.volume);
        }
    });
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

export const resolveContainer = (c, type, volumes, workload) => { //容器处理
    const cg = getFromModel(c);
    const container = {
        type, //类型
        containerName: cg('name'), //容器名称
        args: cg('args', []).join('\n'), // 
        command: cg('command', []).join('\n'),
        env: resolveEnv(cg('env', [])), // 容器环境变量
        image: cg('image'), //容器镜像
        imagePullPolicy: cg('imagePullPolicy'), //镜像拉取策略
        // log: resolveLogs(cg('volumeMounts', [])),
        probe: {  //探针
            postStart: resolveLifeCycle(cg('lifecycle.postStart')),
            preStop: resolveLifeCycle(cg('lifecycle.preStop')),
            liveness: resolveProbe(cg('livenessProbe', null)),
            readiness: resolveProbe(cg('readinessProbe', null)),
        },
        ports: resolveContainerPorts(cg('ports', null)), //端口
        resources: resolveResource(cg('resources', null)), //资源配额
        volumes: resolveVolumes(cg('volumeMounts', []), volumes), // 数据卷
        uniqueid: uniqueid++, // uid
        status: toStatusPlainObject(workload, cg('name')), // 容器状态
        raw: cloneDeep(c), // 原始的数据
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
    const containers = g('containers', []); // 普通容器
    const initContainers = g('initContainers', []); // init容器
    const volumes = g('volumes', []);
    const nc = containers.map(c => resolveContainer(c, 'normal', volumes, workload));
    const initc = initContainers.map(c => resolveContainer(c, 'init', volumes, workload));
    return nc.concat(initc);
};

export const refactContainer = (c, podVolumes, podVolumesYaml, cIndex) => {
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
        cg('containerName'), // 容器名称
        cg('args').split('\n').filter(i => i).map(i => i.replaceAll('\r', '')), // 启动命令参数
        cg('command').split('\n').filter(i => i).map(i => i.replaceAll('\r', '')), //启动命令
        refactEnv(cg('env')), //环境变量
        cg('image'), //镜像
        cg('imagePullPolicy'), // 镜像拉取策略
        refactLifeCycle(cg('probe.postStart')), // 生命周期-启动后配置
        refactLifeCycle(cg('probe.preStop')), // 生命周期-停止前执行配置
        refactProbe(cg('probe.liveness')), // 存活探针
        refactProbe(cg('probe.readiness')), // 就绪探针
        refactPorts(cg('ports')), // 端口
        refactResouce(cg('resources')), //资源配置
        // refactVolumes(cg('volumes'), cg('containerName'), podVolumes, podVolumesYaml),  
        refactVolumes(cg('volumes'), cIndex, podVolumes, podVolumesYaml), //容器名过程名过长时挂载会有问题，使用index代替 // 数据卷
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
        otherVolume: [],
    };
    cg('containers', []).forEach((c, cIndex) => { // 区分init容器及普通容器
        if (c.type === 'normal') {
            containers.push(refactContainer(c, podVolumes, podVolumesYaml, cIndex));
        }
        if (c.type === 'init') {
            let temp = refactContainer(c, podVolumes, podVolumesYaml, cIndex)
            temp = omit(temp, [ 'lifecycle', 'livenessProbe', 'readinessProbe' ])
            initContainers.push(temp);
        }
    });
    return {
        containers,
        initContainers,
        volumes: flatten(Object.values(podVolumesYaml)),
    };

};


export const getDefaultContainer = () => ({
    containerName: '', //容器名称
    type: 'normal', // 容器类型
    image: '', // 容器镜像
    imagePullPolicy: 'Always', //镜像拉取策略
    resources: { // 资源配置
        type: 0,
        cpu: 0.1,
        gpu: 0,
        memory: 128,
        multiple: 1,
    },
    volumes: { //数据卷
        pvc: [],
        configmap: [],
        secret: [],
        emptyDir: [],
        hostpath: [],
        vct: [],
        otherVolume: [],
    },
    log: [],
    env: { // 环境变量
        value: [],
        secretKeyRef: [],
        configMapKeyRef: [],
        fieldRef: [],
        resourceFieldRef: [],
    },
    command: '', // 启动命令
    args: '', // 启动命令参数
    probe: { // 探针
        liveness: { //存活探针
            enable: false,
            failureThreshold: 3,
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
        readiness: { // 就绪探针
            enable: false,
            failureThreshold: 3,
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
        preStop: { //生命周期-停止前
            enable: false,
            method: 'exec',
            command: '',
            host: '',
            path: '',
            port: 1,
            httpHeaders: [],
        },
        postStart: { // 生命周期-启动后
            enable: false,
            method: 'exec',
            command: '',
            host: '',
            path: '',
            port: 1,
            httpHeaders: [],
        },
    },
    ports: { // 端口
        enable: false,
        configs: [],
    },
    uniqueid: uniqueid++,
    showAdvanced: false,
});
