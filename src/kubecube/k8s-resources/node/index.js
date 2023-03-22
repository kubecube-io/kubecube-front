import {
    toPlainObject as toCommonPlainObject,
} from '../base/common';
import { getFromModel } from '../base/utils';
import { NODE_STATUS_MAP } from 'kubecube/utils/constance';

export function toPlainObject(model) {
    const g = getFromModel(model);
    return toCommonPlainObject(model)({
        toSpecPlainObject() {
            const labels = g('metadata.labels') || {};
            // const type = labels['system/tenant'] === 'netease.share' ? labels['system/tenant'] : labels['system/status'];
            /*
                “共享”：标签中存在"node.kubecube.io/status"="assigned"且"node.kubecube.io/tenant"="share"
                “独占”：
                ​		标签中存在"node.kubecube.io/status"="unassigned"
                ​		标签中存在"node.kubecube.io/status"="assigned"且"node.kubecube.io/tenant"的值不等于"share"
             */
            let type = '-';
            if (labels['node.kubecube.io/status'] === 'assigned' && labels['node.kubecube.io/tenant'] === 'share') {
                type = '共享';
            } else if (labels['node.kubecube.io/status'] === 'unassigned' || (labels['node.kubecube.io/status'] === 'assigned' && labels['node.kubecube.io/tenant'] !== 'share')) {
                type = '独占';
            }
            const mixed = labels['colocation.netease.com/node-pool'] === 'colocation';
            return {
                ...g('spec'),
                type,
                mixed,
            };
        },
        toStatusPlainObject() {
            const addresses = g('status.addresses') || [];
            const p = addresses.find(addr => addr.type === 'InternalIP');
            const conditions = g('status.conditions') || [];
            const unschedulable = g('spec.unschedulable');
            let statusText = '';
            if (model.extendInfo) {
                statusText = model.extendInfo.status;
            } else {
                statusText = unschedulable ?
                    NODE_STATUS_MAP.unschedulable :
                    conditions.find(cond => cond.type === 'Ready' && cond.status === 'True') ?
                        NODE_STATUS_MAP.normal :
                        NODE_STATUS_MAP.abnormal;
            }
            return {
                nodeIP: (p || {}).address || '',
                ...g('status'),
                statusText,
            };
        },
    });
}
