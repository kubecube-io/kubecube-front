import {
    toPlainObject as toCommonPlainObject,
} from '../base/common';
import { getFromModel } from '../base/utils';
import { NODE_TYPE_MAP, NODE_STATUS_MAP } from 'kubecube/utils/constance';

export function toPlainObject(model) {
    const g = getFromModel(model);
    return toCommonPlainObject(model)({
        toSpecPlainObject() {
            const labels = g('metadata.labels') || {};
            const type = labels['system/tenant'] === 'netease.share' ? labels['system/tenant'] : labels['system/status'];
            return {
                ...g('spec'),
                type: NODE_TYPE_MAP[type] || '-',
            };
        },
        toStatusPlainObject() {
            const addresses = g('status.addresses') || [];
            const p = addresses.find(addr => addr.type === 'InternalIP');
            const conditions = g('status.conditions') || [];
            const unschedulable = g('spec.unschedulable');
            const statusText = unschedulable ?
                NODE_STATUS_MAP.unschedulable :
                conditions.find(cond => cond.type === 'Ready' && cond.status === 'True') ?
                    NODE_STATUS_MAP.normal :
                    NODE_STATUS_MAP.abnormal;
            return {
                nodeIP: (p || {}).address || '',
                ...g('status'),
                statusText,
            };
        },
    });
}
