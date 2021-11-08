const EVENTS_MAPPING = [
    { text: '容器失败', value: 'Failed' },
    { text: '容器抢占', value: 'Preempting' },
    { text: '容器被杀', value: 'Killing' },
    { text: '容器启动退让', value: 'BackOff' },
    { text: '容器超出优雅终止时间', value: 'ExceededGracePeriod' },
    { text: '杀死副本失败', value: 'FailedKillPod' },
    { text: '创建副本容器失败', value: 'FailedCreatePodContainer' },
    { text: '副本网络未就绪', value: 'NetworkNotReady' },
    { text: '坏镜像不拉取', value: 'ErrImageNeverPull' },
    { text: '容器不健康', value: 'Unhealthy' },
    { text: '容器探针告警', value: 'ProbeWarning' },
    { text: '容器状态同步失败', value: 'FailedSync' },
    { text: '启动后钩子执行失败', value: 'FailedPostStartHook' },
    { text: '停止前钩子执行失败', value: 'FailedPreStopHook' },
];

export {
    EVENTS_MAPPING,
};
