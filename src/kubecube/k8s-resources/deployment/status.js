import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    return {
        desired: cg('spec.replicas', 0), // 预期的副本数
        updated: cg('status.updatedReplicas', 0), // 已经是最新版本的副本数
        available: cg('status.availableReplicas', 0), // 可用副本数
        unavailable: cg('status.unavailableReplicas', 0), // 不可用副本数
        total: cg('status.replicas', 0), // 总副本数
        conditions: cg('status.conditions', []), // 状况条目
        readyReplicas: cg('status.readyReplicas', 0), // 就绪副本
    };
};
