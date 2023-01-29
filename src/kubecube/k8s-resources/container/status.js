import {
    getFromModel,
} from '../base';

export const toPlainObject = (model, containerName) => {
    const cg = getFromModel(model);
    const containerStatus = (cg('status.containerStatuses', []) || []); // 业务容器状态信息
    const initContainerStatuses = (cg('status.initContainerStatuses', []) || []); // init容器状态信息

    return [ ...containerStatus, ...initContainerStatuses ].find(c => c.name === containerName) || { state: { unknown: {} } };
};
