import workloadService from 'kubecube/services/k8s-resource';
import { toPlainObject as toDeploymentPlainObject } from 'kubecube/k8s-resources/deployment';

const filters = {
    status(status) {
        return `${status.desired} desired, ${status.updated} updated, ${status.available} available, ${status.unavailable} unavailable, ${status.total} total`;
    },
};

const listColumns = [
    { title: '名称', name: 'name', sortable: true },
    { title: '状态', name: 'status', width: '320px' },
    { title: '创建时间', name: 'creationTimestamp', width: '200px', sortable: true },
    { title: '操作', name: 'operation', sortable: false, width: '200px' },
];

const service = {
    create: workloadService.createWorkload,
    list: workloadService.getWorkloads,
    get: workloadService.getInstance,
    delete: workloadService.deleteInstance,
    modify: workloadService.modifyWorkload,
    patch: workloadService.patchWorkload,
};

const resolver = toDeploymentPlainObject;

export default {
    filters,
    listColumns,
    service,
    resolver
};
