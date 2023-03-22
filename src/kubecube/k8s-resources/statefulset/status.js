import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    return {
        desired: cg('spec.replicas', 0),
        total: cg('status.replicas', 0),
        readyReplicas: cg('status.readyReplicas', 0),
        conditions: cg('status.conditions', []),
    };
};
