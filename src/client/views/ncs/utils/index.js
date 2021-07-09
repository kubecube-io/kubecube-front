import {
    SEVERITY_MAP,
    MIDDLE_STATUS_LIST,
    SEVERITY_TEXT_MAP,
    RELEASE_STATUS_MAP,
} from './map';
import { ignoredKeys } from './filters';
import filters from './filters';

import _ from 'lodash';


/**
 * 处理工作负载的状态
 * @param {Object} workload - 工作负载
 * @param {Boolean} stateful - 是否有状态
 */
const getStatus = (workload, stateful = false) => {
    const { RequestK8sSuccess, podInfo, status } = workload;

    // 新增：status.replicas为空，展示 warning
    if(RequestK8sSuccess !== 'True' || podInfo.warnings.length || (status && !status.replicas)) 
        return 'warning';
    else if(podInfo.pending)
        return 'waiting';
    else   
        return 'success';

};

/**
     * 从镜像的imagePath中取出版本号
     * @param  {String} _path imagePath
     * @return {String}       版本号
     */
const getTagFromImagePath = (path) => {
    path = path || '';
    let result;

    result = path.split('/').pop();
    result = result.split(':');
    result = (result.length < 2) ? 'latest' : result.pop();

    return result;
};
const getRepoDesc = (info) => {
    if (!info || (info && !Object.keys(info).length))
        return '没有选择镜像';
    return info.userName + '/' + info.repoName + ':' + this.getTagFromImagePath(info.selectedPath);
};

const getDefaultContainer = (stateful) => {
    const container = {
        Name: '', // 容器名
        Image: '', // 镜像URL
        LogDirs: [], // 日志路径数组
        Args: [], // Docker CMD命令。
        Command: [], // Docker EntryPoint命令.
        Envs: [], // 环境变量数组
        ResourceRequirements: {},
        SecurityContext: { // SecurityContext (安全选项)
            Privilege: false, // 默认权限或root权限
            Capabilities: [], // 容器权限
        },
    };

    if (stateful) {
        Object.assign(container, {
            SshKeyIds: [],
            DataDisks: [],
        });
    }
    return container;
};

const getCPU = ((cpu = '') => cpu.includes('m') ? (cpu.split('m')[0] / 1000) : (cpu ? +cpu : 0.1));
const getMemory = (memory = '') => {
    // 默认值
    if(!memory) return 128;
    const MAP = ['Mi', 'Gi', 'Ti'];
    const value = memory.split('i')[0].slice(0, -1);
    const index = MAP.findIndex((unit) => memory.endsWith(unit));
    return index !== -1 ? (value * Math.pow(1024, index)) : value;
};
/**
 * 将k8s经过转化后的数值字符串转化为数值
 * 后缀字符和数字的对应关系： 【10^-3 m】 【10^3 k】 【10^6 M】【10^9 G】
 * @param {String} num - k8s经过转化后的数值字符串
 * @returns {Number}
 */
const formatNumber = (num = '') => {
    const value = parseInt(num);
    const map = {
        m: -3,
        '': 0,
        k: 3,
        M: 6,
        G: 9,
    };
    if(isNaN(value)) return 0;
    const suffix = num.slice(value.toString().length);
    const multiple = suffix in map ? Math.pow(10, map[suffix]) : 1;

    return multiple * value;
};

// 现在后端返回的工作负载（Deployment || statefulSet）实例数据结构太过复杂，需要处理下
/**
 * @param {object} model - 后端返回的工作负载实例模型
 * @param {boolean} simple - 是否简单模式
 * @param {string} type - 工作负载类型(Deployment || StatefulSet)[暂时没用到]
 */
const normalizeWorkload = (model = {}, simple = false) => {
    const { metadata, RequestK8sSuccess, pods: podInfo, status, spec } = model;
    const { name, namespace, creationTimestamp, labels: workloadLabels } = (metadata || {});
    const [ minReadySeconds, replicas, serviceName, volumeClaimTemplates, matchLabels, strategy, maxSurge, maxUnavailable ] = _.at(spec || {}, [ 
        'minReadySeconds', 'replicas', 'serviceName', 'volumeClaimTemplates', 'selector.matchLabels', 
        'strategy', 'strategy.rollingUpdate.maxSurge', 'strategy.rollingUpdate.maxUnavailable',
    ]);
    const [ labels, containers, volumes, restartPolicy, imagePullSecrets, affinity ] = _.at(spec || {}, [ 
        'template.metadata.labels', 'template.spec.containers', 'template.spec.volumes', 
        'template.spec.restartPolicy', 'template.spec.imagePullSecrets','template.spec.affinity',
    ]);

    // 自定义字段
    podInfo && (podInfo.message = RequestK8sSuccess !== 'True' ? '无法获取状态' : (podInfo.warnings && podInfo.warnings.length && podInfo.warnings[0].message));

    // 简单模式返回
    if(simple) {
        return {
            name,
            status,
            replicas,
            namespace,
            creationTimestamp,
            RequestK8sSuccess,
            podInfo: podInfo || {},
            fullModel: model,
        };
    }

    // 后续有对内部的字段进行调整
    const tmpContainers = _.cloneDeep(containers);
    // 筛掉系统默认标签
    const customLabels = {};
    const systemLabels = {};
    Object.keys(labels).forEach((item) => {
        if(ignoredKeys.find((key) => item.startsWith(key)))
            systemLabels[item] = labels[item];
        else 
            customLabels[item] = labels[item];
    });

    tmpContainers.forEach((item) => {
        let [ cpu, memory, limitCPU ] = _.at(item.resources || {}, [ 'requests.cpu', 'requests.memory', 'limits.cpu' ]);
        const gpu = ((item.resources || {}).limits || {})['nvidia.com/gpu'];
        cpu = getCPU(cpu);
        // 为对应的requests的cpu、memory(对应为小数格式，不带’m‘或’Mi'单位)
        // 重写对应的resource
        item.resources = {
            cpu,
            gpu: formatNumber(gpu) || 0, // 非必然返回的字段
            memory: getMemory(memory),
            multiple: Math.round(getCPU(limitCPU) / cpu) || 1,
        };

        const volumeMounts = item.volumeMounts || [];
        item.dirs = volumeMounts.filter((item) => item.name.startsWith('log-volume')).map((item) => ({ dir: item.mountPath }));
        item.volumes = volumeMounts.filter((item) => item.name.startsWith('data-volume'))
            .map((item) => {
                const volume = volumes.find((sub) => sub.name === item.name);
                const names = _.at(volume || {}, [ 'persistentVolumeClaim.claimName', 'secret.secretName', 'configMap.name' ]);
                const index = names.findIndex((item) => item);
                const type = ['pvc', 'secret', 'configMap'][index];
                return {
                    type,
                    name: names[index],
                    mountPath: item.mountPath,
                    pvcName: names[0] || '',
                    secretName: names[1] || '',
                    configMapName: names[2] || '',
                    volumeClaimTemplateName: '',
                };
            });
        // const volumeClaimTemplates = volumeMounts.filter((item) => (volumeClaimTemplates || []).find((subItem) => subItem.metadata.name === item.name)).map((item) => ({
        // todo
        const volumeClaimTemplates = volumeMounts.filter((item) => !['log-volume', 'data-volume'].some((keyword) => item.name.startsWith(keyword))).map((item) => ({
            type: 'volumeClaimTemplate',
            name: item.name,
            mountPath: item.mountPath,
            volumeClaimTemplateName: item.name,
            pvcName: '',
            secretName: '',
            configMapName: '',
        }));
        item.volumes.push(...volumeClaimTemplates);
    });

    return Object.assign({}, { 
        metadata,
        name, 
        status, 
        replicas,
        strategy,
        namespace, 
        matchLabels, 
        creationTimestamp,
        RequestK8sSuccess,
        labels: workloadLabels,
        
        serviceName, // statefulSet专用
        volumeClaimTemplates: (volumeClaimTemplates || []).map((item) => ({
            name: item.metadata.name,
            mode: item.spec.accessModes[0],
            storageClassName: item.spec.storageClassName,
            storage: parseInt(item.spec.resources.requests.storage),
        })),    

        maxSurge,
        maxUnavailable,
        minReadySeconds,
        pod: { 
            labels,
            customLabels,
            systemLabels,
            restartPolicy,
            imagePullSecrets: imagePullSecrets ? imagePullSecrets.map((item) => item.name) : [],
            nodeAffinity: (affinity || {}).nodeAffinity,
            podAffinity: (affinity || {}).podAffinity,
            podAntiAffinity: (affinity || {}).podAntiAffinity,
        },
        podInfo: podInfo || {},
        containers: tmpContainers.map((item, index) => Object.assign({}, item, { fullModel: containers[index]} )),
        fullModel: model,
    });
};

const normalizePod = (model = {}) => {
    const { name, creationTimestamp, namespace, ownerReferences } = model.metadata || {};
    const { phase, podIP } = model.status || {};
    let cpuUsage = 0, memoryUsage = 0;
    let containers = (model.status || {}).containerStatuses || [];
    const restartCount = containers.reduce((acc, next) => acc + next.restartCount, 0);
    (model.spec.containers || []).forEach((item) => {
        const [cpu, memory] = _.at(item, ['resources.requests.cpu', 'resources.requests.memory']);
        cpuUsage += getCPU(cpu);
        memoryUsage += getMemory(memory);
    });
    // container.status为自定义字段，running || terminated || waiting，默认取waiting
    containers.forEach((item) => item.status = Object.keys(item.state)[0] || 'waiting');
    return Object.assign({}, {
        name, 
        namespace,
        restartCount,
        ownerReferences,
        creationTimestamp, 
        phase, 
        podIP,
        containers,
        // 多个容器的cpu相加，由于是小数,会出现小数位过多的情况
        cpuUsageText: (cpuUsage.toString().split('.')[1].length > 3 ? cpuUsage.toFixed(3) : cpuUsage) + ' Cores',
        memoryUsageText: memoryUsage + ' MiB',
        fullModel: model,
    });
};

const normalizeService = (model = {}) => {
    const item = model.item || {};
    const { name, creationTimestamp, namespace, labels, annotations } = item.metadata || {};
    const { ports, selector, clusterIP, type } = item.spec || {};
    // 自定义
    const host = name + '.' + namespace;
    let template = (annotations || {}).template || '';
    // 如果annotations没有template字段声明，需要额外的逻辑初始化
    if(!template) {
        if(type === 'NodePort')
            template = 'nodePort';
        else if(clusterIP === 'None')
            template = 'headless';
        else if(Object.keys(selector || {}).length)
            template = 'normal';
        else
            template = 'external';
    }

    return Object.assign({}, {
        name, 
        labels,
        namespace,
        annotations: annotations || {},
        creationTimestamp, 
        host,
        type,
        ports,
        clusterIP,
        template,
        selector: selector || {}, // 存在selector为undefined的合法情形，做兼容
        extendInfo: (model.extendInfo && model.extendInfo.ips) ? model.extendInfo : { ips: []}, // 兼容extendInfo的接口返回
        fullModel: item,
    });
};

const normalizeIngress = (model = {}) => {
    const { name, creationTimestamp, namespace, labels, annotations } = model.metadata || {};
    const [ rules, tls ] = _.at(model || {}, [ 'spec.rules', 'spec.tls' ]);
    
    const port = tls ? 443 : 80;
    const useSameSecret = tls && tls.length > 1 ? false : true;
    let map = [];
    if(!useSameSecret) {
        tls.forEach((item) => {
            item.hosts.forEach((host) => map[host] = item.secretName);
        });
    }
    
    return Object.assign({}, {
        port,
        dispatch: annotations['nginx.ingress.kubernetes.io/load-balance'] || 'round_robin',
        secretName: tls && tls[0].secretName,
        enableSession: !!annotations['nginx.ingress.kubernetes.io/session-cookie-name'],
        cookieName: annotations['nginx.ingress.kubernetes.io/session-cookie-name'],
        useSameSecret,

        rules: !useSameSecret ? rules.map((item) => Object.assign(item, { secretName: map[item.host] })) : rules,
        tls,
        name, 
        labels,
        namespace,
        annotations,
        creationTimestamp, 
        fullModel: model,
    });
};

const normalizeSecret = (model = {}) => {
    const { name, creationTimestamp, namespace, labels } = model.metadata || {};
    const { type, data } = model;

    return Object.assign({}, {
        type,
        data: data || {},
        name, 
        isDefault: 'system/defaultImagePullSecret' in (labels || {}),
        namespace,
        creationTimestamp, 
        fullModel: model,
    });
};

const normalizeConfigMap = (model = {}) => {
    const { name, creationTimestamp, namespace } = model.metadata || {};

    return Object.assign({}, {
        data: model.data || {},
        binaryData: model.binaryData || {},
        name, 
        namespace,
        creationTimestamp, 
        fullModel: model,
    });
};

const sizeProcessor = function(result) {
    // this为monitor-chart
    const keys = this.metrics.map((item) => item.key);
    const max = Math.max.apply(null, _.flatten( result.map((item) => keys.map((key) => item[key])) ));
    const { unit } = filters.num(isNaN(+max) ? 0 : max);
    const multiple = Math.pow(1024, ['B', 'K', 'M', 'G', 'T', 'P'].indexOf(unit));
    this.unit = (unit === 'B' || !unit || !this.unit.startsWith('B')) ? this.unit : (unit + 'i' + this.unit);

    result.forEach((item) => {
        keys.forEach((key) => item[key] = (item[key] / multiple).toFixed(2));
    });
    return result;
};

const getStep = (startTime, endTime) => {
    // 是否以秒为最小单位（一搬为毫秒）
    const isSecond = (endTime + '').length < 12;
    // period为min为单位
    let period = (endTime - startTime) / 60;
    !isSecond && (period = Math.floor(period / 1000));
    // 6h、24h、7d、30d
    const PERIOD_MAP = [0, 6 * 60, 24 * 60, 24 * 7 * 60, 30 * 24 * 60];
    const STEP_MAP = ['1m', '15m', '1h', '6h', '1d'];
    const index = PERIOD_MAP.findIndex((item, index, arr) => index < (arr.length - 1) ? (period >= item && period < arr[index + 1]) : true );

    return STEP_MAP[index];
};

const getDashBoardTabs = (uiAuth) => [
    uiAuth.viewClusterMonitor ? { title: '资源', name: 'dashboard.index.resource' } : null,
    uiAuth.viewTenantMonitor ? { title: '租户', name: 'dashboard.index.tenant' } : null,
    uiAuth.viewProjectMonitor ? { title: '项目', name: 'dashboard.index.project' } : null,
    uiAuth.viewIngressMonitor ? { title: '负载均衡', name: 'dashboard.index.ingress' } : null,
].filter(Boolean);

const normalizeTag = (tag) => {
    const scanInfo = tag.scan_overview || {};
    const { summary, total } = scanInfo.components || {};
    const { update_time, severity, scan_status, job_id } = scanInfo;
    const { name, architecture, os, docker_version, created, author, size } = tag;
    const tmp = { unknow: 0, hard: 0, normal: 0, small: 0, none: 0 };
    summary && summary.forEach((item) => {
        tmp[SEVERITY_MAP[item.severity]] = item.count;
    });

    return {
        os,
        name,
        architecture,
        docker_version,
        size: (size / 1024 / 1024).toFixed(2),
        author: author.replace(/"/g, ''),
        createTime: created,
        scanInfo: Object.assign({}, tmp, {
            hasScan: !!tag.scan_overview, // 是否扫描过
            total,
            id: job_id,
            status: scan_status,
            time: update_time,
            scanning: MIDDLE_STATUS_LIST.includes(scan_status),
            severity,
            severityText: SEVERITY_TEXT_MAP[severity]
        }),
    };
};

const getReleaseStatusText = (status) => {
    status = status ? status.toLowerCase() : 'unknown';
    return RELEASE_STATUS_MAP[status] || '未知状态';
};

const normalizePDB = (model = {}) => {
    const spec = model.spec || {};
    const [ matchLabels, matchExpressions ] = _.at(spec, ['selector.matchLabels', 'selector.matchExpressions']);
    const ruleKind = 'maxUnavailable' in spec ? 'maxUnavailable' : 'minAvailable';
    return {
        ruleKind,
        ruleValue: spec[ruleKind],
        matchLabels: matchLabels || {},
        matchLabelTexts: matchLabels ? Object.keys(matchLabels).map((key) => key + ':' + matchLabels[key]) : [],
        matchExpressions: matchExpressions || [],
        matchExpressionTexts: matchExpressions ? matchExpressions.map((item) => {
            const { key, operator, values } = item;
            let tmp = 'key:' + key + ' operator:' + operator;
            values && (tmp = tmp + ' values:' + item.values.join(', '));
            return tmp;
        }) : [],
        name: model.metadata.name,
    };
};

// 处理后端处理过的workload返回(用于设置页面的数据处理<部分参数不需要>)
const formatExternalWorkload = (model = {}) => {
    const { metadata, status, spec } = model;
    const { name, namespace, labels: workloadLabels } = (metadata || {});
    const [ replicas, serviceName, volumeClaimTemplates, matchLabels ] = _.at(spec || {}, [ 
        'replicas', 'serviceName', 'volumeClaimTemplates', 'selector.matchLabels', 
    ]);
    const [ labels, containers, hostNetwork, restartPolicy, imagePullSecrets, affinity ] = _.at(spec || {}, [ 
        'template.metadata.labels', 'template.spec.containers', 'template.spec.hostNetwork',
        'template.spec.restartPolicy', 'template.spec.imagePullSecrets','template.spec.affinity',
    ]);

    // 后续有对内部的字段进行调整
    const tmpContainers = _.cloneDeep(containers);
    // 筛掉系统默认标签
    const customLabels = {};
    const systemLabels = {};
    Object.keys(labels).forEach((item) => {
        if(ignoredKeys.find((key) => item.startsWith(key)))
            systemLabels[item] = labels[item];
        else 
            customLabels[item] = labels[item];
    });

    tmpContainers.forEach((item) => {
        let [ cpu, memory, limitCPU ] = _.at(item.resources || {}, [ 'requests.cpu', 'requests.memory', 'limits.cpu' ]);
        const gpu = ((item.resources || {}).limits || {})['nvidia.com/gpu'];
        cpu = getCPU(cpu);
        // 为对应的requests的cpu、memory(对应为小数格式，不带’m‘或’Mi'单位)
        // 重写对应的resource
        item.resources = {
            cpu,
            gpu: formatNumber(gpu) || 0, // 非必然返回的字段
            memory: getMemory(memory),
            multiple: Math.round(getCPU(limitCPU) / cpu) || 1,
        };

        // 筛掉系统默认标签(cicd服务需要)
        item.customEnvs = [];
        item.systemEnvs = [];
        item.env && item.env.forEach((subItem) => subItem.name.startsWith('SKIFF_') ? item.systemEnvs.push(subItem) : item.customEnvs.push(subItem));

        item.dirs = item.logs.map((item) => ({ dir: item }));
    });

    return Object.assign({}, { 
        metadata,
        name, 
        status, 
        replicas,
        namespace, 
        matchLabels, 
        hostNetwork,
        labels: workloadLabels,
        
        serviceName, // statefulSet专用
        volumeClaimTemplates: (volumeClaimTemplates || []).map((item) => ({
            name: item.metadata.name,
            mode: item.spec.accessModes[0],
            storageClassName: item.spec.storageClassName,
            storage: parseInt(item.spec.resources.requests.storage),
        })),    

        pod: { 
            labels,
            customLabels,
            systemLabels,
            restartPolicy,
            imagePullSecrets: imagePullSecrets ? imagePullSecrets.map((item) => item.name) : [],
            nodeAffinity: (affinity || {}).nodeAffinity,
            podAffinity: (affinity || {}).podAffinity,
            podAntiAffinity: (affinity || {}).podAntiAffinity,
        },
        containers: tmpContainers,
        fullModel: model,
    });
};

// 获取 nodes 的 cpu、memory、gpu 的数据之和
const getNodeInfo = (list = []) => {
    list = Array.isArray(list) ? list : [];
    return list.reduce((acc, item) => {
        acc.cpu += item.capacityCpu;
        acc.memory += item.capacityMemory;
        acc.gpu += item.capacityGpu;
        return acc;
    }, { cpu: 0, memory: 0, gpu: 0 });
};
/**
 * @description 返回符合u-transfer组件要求的数据结构信息(保留后端原有的capacityCpu等字段信息)
 * 
 * @param {Array} list - 节点列表
 * @param {Boolean} disabled - 是否disabled节点的移动
 */
const formatNodes = (list = [], disabled = false) => {
    return list.map((item) => Object.assign(item, {
        text: item.name + `（C:${item.capacityCpu} M:${item.capacityMemory} G:${item.capacityGpu}）`, 
        value: item.name,
        disabled,
    }));    
};


export {
    getStatus,

    getTagFromImagePath,
    getRepoDesc,
    getDefaultContainer,

    normalizeWorkload,
    normalizePod,
    normalizeService,
    normalizeIngress,
    normalizeSecret,
    normalizeConfigMap,
    normalizeTag,
    normalizePDB,

    sizeProcessor,
    getStep,
    getDashBoardTabs,

    formatNumber,
    getCPU,
    getMemory,
    formatNodes,
    getNodeInfo,

    getReleaseStatusText,

    formatExternalWorkload,
};
