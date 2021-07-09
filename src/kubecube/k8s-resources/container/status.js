import {
    getFromModel,
} from '../base';

export const toPlainObject = (model, containerName) => {
    const cg = getFromModel(model);
    const containerStatus = (cg('status.containerStatuses', []) || []);
    const initContainerStatuses = (cg('status.initContainerStatuses', []) || []);

    return [ ...containerStatus, ...initContainerStatuses ].find(c => c.name === containerName) || { state: { unknown: {} } };
};
