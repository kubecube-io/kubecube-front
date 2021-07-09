import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    return {
        desired: cg('spec.replicas', 0),
        updated: cg('status.updatedReplicas', 0),
        available: cg('status.availableReplicas', 0),
        unavailable: cg('desired-available', 0),
        total: cg('spec.replicas', 0),
        conditions: cg('status.conditions', []),
    };
};
