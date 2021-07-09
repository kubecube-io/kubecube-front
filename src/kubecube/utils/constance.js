export const ROLES = {
    PLATFORM_ADMIN: 'platformAdmin',
    TENANT_ADMIN: 'tenantAdmin',
    PROJECT_ADMIN: 'projectAdmin',
    REVIEWER: 'reviewer',
};
export const RESOURCE_REQUEST_MAP = [
    { cpu: 0.1, memory: 128 },
    { cpu: 0.5, memory: 512 },
    { cpu: 1, memory: 1024 },
];
export const FIELD_DATA = [
    'metadata.name',
    'metadata.namespace',
    'metadata.uid',
    'spec.nodeName',
    'spec.serviceAccountName',
    'status.hostIP',
    'status.podIP',
];

export const RESOURCE_DATA = [
    'requests.ephemeral-storage',
    'requests.memory',
    'requests.cpu',
    'limits.ephemeral-storage',
    'limits.memory',
    'limits.cpu',
];

export const PVC_MODE_MAP = [
    'ReadWriteOnce',
    'ReadOnlyMany',
    'ReadWriteMany',
];

export const PVC_MODE_TEXT_MAP = {
    ReadWriteOnce: '独占读写',
    ReadOnlyMany: '只读共享',
    ReadWriteMany: '共享读写',
};

export const topologyKeyData = [
    'kubernetes.io/hostname',
    'failure-domain.beta.kubernetes.io/zone',
    'failure-domain.beta.kubernetes.io/region',
    'beta.kubernetes.io/instance-type',
];

export const CONTAINERTYPE = {
    normal: {
        text: '业务容器',
        icon: 'container',
    },
    init: {
        text: 'init 容器',
        icon: 'initcontainer',
    },
};

export const JOB_STATUS_MAP = {
    Pending: {
        text: '未就绪',
        icon: 'expire',
    },
    Running: {
        text: '执行中',
        icon: 'waiting',
    },
    Complete: {
        text: '执行完成',
        icon: 'success',
    },
    Failed: {
        text: '执行失败',
        icon: 'error',
    },
};

export const CLUSTER_STATUS_MAP = {
    health: '正常',
    unhealth: '异常',
    unhealthy: '异常',
};

export const SERVICE_LOAD_BALANCER_IP_TYPE_MAP = {
    private: {
        text: '私有网 IP',
    },
    public: {
        text: '公网 IP',
    },
    idc: {
        text: '机房网 IP',
    },
};

export const NODE_TYPE_MAP = {
    'netease.share': '共享',
    assigned: '独占',
    unassigned: '独占',
};

export const NODE_STATUS_MAP = {
    unschedulable: '维护中',
    normal: '正常',
    abnormal: '异常',
};

export const CEPH_TYPE_MAP = {
    'kubernetes.io/rbd': 'CephRbd',
    'ceph.com/rbd': 'CephRbd',
};

export const ignoredKeys = [ 'system', 'kubernetes.io', 'beta.kubernetes.io', 'cicd.skiff.netease.com' ];

export const PORTS = [
    { text: 80, value: 80 },
    { text: 443, value: 443 },
];

export const DISPATCHS = [
    { text: 'least connections', value: 'least_conn' },
    { text: 'round robin', value: 'round_robin' },
    { text: 'ip hash', value: 'ip_hash' },
];

export const SECRET_TYPES = [
    { value: 'Opaque', text: 'Opaque' },
    { value: 'kubernetes.io/tls', text: 'IngressTLS' },
    { value: 'kubernetes.io/dockerconfigjson', text: 'DockerConfigJson' },
];

export const SECRET_TYPES_ENUM = {
    Opaque: 'Opaque',
    IngressTLS: 'kubernetes.io/tls',
    DockerConfigJson: 'kubernetes.io/dockerconfigjson',
};

export const RESOURCE_RIGHTS = {
    READ: 'READ',
    WRITE: 'WRITE',
};
export const RESOURCE_AUTH_MAP = {
    get: RESOURCE_RIGHTS.READ,
    list: RESOURCE_RIGHTS.READ,
    watch: RESOURCE_RIGHTS.READ,
    create: RESOURCE_RIGHTS.WRITE,
    update: RESOURCE_RIGHTS.WRITE,
    delete: RESOURCE_RIGHTS.WRITE,
};

export const RESOURCE_CONVERT_AUTH_MAP = {
    READ: [ 'get', 'list', 'watch' ],
    WRITE: [ 'create', 'update', 'delete' ],
};


export const LOG_TYPE = {
    dockerStdout: '容器标准输出',
    k8sLogfile: '容器日志文件',
    logfile: '节点日志文件',
};

export const LOG_STATUS = {
    waiting: '待下发',
    loaded: '已下发',
    error: '异常',
    disabled: '关闭',
    unknown: '未知',
};

export const OPERATORS = [
    { text: '匹配标签', value: 'label', placeholder: '' },
    { text: '操作符 In', value: 'In', placeholder: '可输入多个值，用空格分割' },
    { text: '操作符 NotIn', value: 'NotIn', placeholder: '可输入多个值，用空格分割' },
    { text: '操作符 Exists', value: 'Exists', placeholder: '请输入整数数值' },
    { text: '操作符 DoesNotExist', value: 'DoesNotExist', placeholder: '请输入整数数值' },
];

export const CLUSTER_NETWORK_TYPE_MAP = {
    // 'openshift-sdn': {
    //     text: 'Openshift SDN',
    // },
    calico: {
        text: 'Calico',
    },
    // vpc: {
    //     text: '网易云 SDN',
    // },
    // other: {
    //     text: 'Other',
    // },
};
