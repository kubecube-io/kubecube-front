import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    return {
        desired: cg('spec.currentReplicas', 0),
        total: cg('spec.replicas', 0),
        conditions: cg('status.conditions', []),
    };
};
