export const dimensions = [
    { text: '空间', value: 'namespace' },
    { text: '副本', value: 'pod' },
    { text: '容器', value: 'container' },
    { text: '负载', value: 'workload' },
];

export const scopesChoice = {
    workload: [
        { text: 'Deployment', value: 'deployment' },
        { text: 'StatefulSet', value: 'statefulset' },
    ],
    storage: [
        { text: 'cephfs', value: 'cephfsPersistentvolumeclaim' },
        { text: '其他', value: 'persistentvolumeclaim' },
    ],
};

export const scopesContent = {
    workload: '工作负载类型',
    storage: '存储源',
    storagecephfs: '存储类型',
    network: '服务类型',
    nodata: '',
    pods: '工作负载类型',
};
