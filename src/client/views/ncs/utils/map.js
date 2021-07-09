// cpu的相关转换map
const SPEC_MAP = ['small', 'medium', 'large', 'xlarge', '2xlarge', '4xlarge'];

const TYPE_MAP = [
    { text: 'GPU 计算型 gnpc1', value: 'gnpc1' },
    { text: 'GPU 计算型 gnpc3', value: 'gnpc3' },
    { text: 'GPU 图形加速 gnpc4', value: 'gnpc4' },
];

const REPO_MAP = {
    'jenkins-java-slave': 'jenkins',
    'jenkins-python-slave': 'jenkins',
    // eslint-disable-next-line
    tomcat_apm: 'tomcat',
    jdk: 'java',
    javaweb: 'javaclass',
    nodejs: 'node',
    'rocket.chat': 'rocket',
    mongo: 'mongodb',
};

const WORKLOAD_STATUS_MAP = {
    running: {
        text: '运行中',
    },
    pending: {
        text: '处理中',
    },
    abnormal: {
        text: '警告',
    },
    arrear: {
        text: '已停服',
    },
    loading: {
        text: '',
    },
};
const POD_STATUS_MAP = {
    texts: {
        Pending: '等待中',
        Running: '运行中',
        Succeeded: '成功终止',
        Failed: '失败终止',
        Unknow: '异常',
    },
    icons: {
        Pending: 'fix',
        Running: 'ok',
        Succeeded: 'ok',
        Failed: 'error',
        Unknow: 'fix',
    },
};
const CONTAINER_STATUS_MAP = {
    texts: {
        Restarting: '重启中',
        Running: '运行中',
        RestartFail: '重启失败',
        Waiting: '创建中',
        Terminated: '终止',
    },
    icons: {
        Restarting: 'fix',
        Running: 'ok',
        RestartFail: 'error',
        Waiting: 'fix',
        Terminated: 'stop',
    },
};
// 可以执行相关操作的状态集
const OPERATE_MAP = {
    // running态所有操作都可以执行
    pending: ['!bind'],
    abnormal: ['!bind'],
    arrear: ['delete', 'unbind'],
    // loading态所有操作都不能执行
    // setting: ['running', 'Running', 'Abnormal'],
    // delete: ['CreateFail', 'Running', 'Abnormal'],
    // // 更多操作里面的
    // resize: ['Running', 'Abnormal'],
    // updateMirror: ['CreateFail', 'Running', 'Abnormal'],
    // changeSpec: ['Running', 'Abnormal'],
    // redeploy: ['Running', 'Abnormal'],
    // 绑定/解绑公网ip
    // bind: ['Running'],
    // unbind: ['Creating', 'CreateFail', 'Running', 'Updating', 'Abnormal'],
};

const OPERATES = ['setting', 'delete', 'resize', 'updateMirror', 'changeSpec', 'redeploy', 'bind', 'unbind'];
// 默认的labels
const DEFAULT_LABELS = ['name', 'zone', 'pod-template-hash'];

const CLUSTER_STATUS_MAP = {
    health: '正常',
    unhealth: '异常',
};

const NODE_TYPE_MAP = {
    'netease.share': '共享',
    assigned: '独占',
    unassigned: '独占',
};

const NODE_STATUS_MAP = {
    unschedulable: '维护中',
    normal: '正常',
    abnormal: '异常',
};

const USER_ROLE_MAP = {
    1: '管理员',
    2: '开发者',
    3: '访客',
};

const TENANT_ID = '1';
const PROJECT_ID = 'p1';

const PVC_MODE_MAP = {
    ReadWriteOnce: '独占读写',
    ReadOnlyMany: '只读共享',
    ReadWriteMany: '共享读写',
};

const CEPH_TYPE_MAP = {
    'kubernetes.io/rbd': 'CephRbd',
    'ceph.com/rbd': 'CephRbd',
};

const RECLAIM_POLICY_MAP = {
    Delete: '立即释放',
    // 暂不开放
    // Retain: '保留',
};

const WORKLOAD_TEXT_MAP = {
    deployment: "Deployment",
    statefulset: "StatefulSet",
};

const POLICY_TRIGGER_MAP = {
    Manual: '手工',
    Scheduled: '定时',
    Immediate: '即刻',
};

const SEVERITY_MAP = {
    5: 'hard',
    4: 'normal',
    3: 'small',
    2: 'unknow',
    1: 'none',
};

const SEVERITY_TEXT_MAP = {
    5: '严重',
    4: '中等',
    3: '较低',
    2: '未知',
    1: '未知'
};

const MIDDLE_STATUS_LIST = [ 'pending', 'running' ];

const RELEASE_STATUS_MAP = {
    unknown: '未知状态',
    deployed: '已部署',
    deleted: '已删除',
    superseded: '已废弃',
    failed: '部署失败',
    deleting: '删除中',
    'pending_install': '部署中',
    'pending_upgrade': '更新中',
    'pending_rollback': '回滚中'
};

export {
    SPEC_MAP,
    TYPE_MAP,
    REPO_MAP,
    WORKLOAD_STATUS_MAP,
    POD_STATUS_MAP,
    CONTAINER_STATUS_MAP,
    OPERATE_MAP,
    OPERATES,
    DEFAULT_LABELS,
    CLUSTER_STATUS_MAP,
    NODE_TYPE_MAP,
    NODE_STATUS_MAP,
    USER_ROLE_MAP,
    PVC_MODE_MAP,
    CEPH_TYPE_MAP,
    RECLAIM_POLICY_MAP,

    TENANT_ID,
    PROJECT_ID,
    WORKLOAD_TEXT_MAP,
    POLICY_TRIGGER_MAP,

    SEVERITY_MAP,
    SEVERITY_TEXT_MAP,
    MIDDLE_STATUS_LIST,

    RELEASE_STATUS_MAP,
};
