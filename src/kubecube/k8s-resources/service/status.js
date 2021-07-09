import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    const ingress = cg('status.loadBalancer.ingress') || [];
    return {
        conditions: cg('status.conditions', []),
        loadBalancer: {
            ingress: ingress.map(i => `${i.hostname || i.ip}`).join(','),
        },
        // loadBalancer:
    };
};
