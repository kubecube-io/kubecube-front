import Service from '@micro-app/common/services/service.js';
// import { formatStorageClass } from '@micro-app/common/views/ncs/utils/format';

const apis = {
    loads: {
        path: '/extends/clusters/{clusterId}/storage/storageclasses',
        method: 'get',
        // process: ({ items = [], total = 0}) => {
        //     return { total, items };
        //     return formatStorageClass(result);
        // },
    },
    create: {
        path: '/storage/clusters/{clusterId}/storageclasses',
        method: 'post',
    },
    delete: {
        path: '/storage/clusters/{clusterId}/storageclasses/{storageClassName}',
        method: 'delete',
    },
    check: {
        path: '/storage/clusters/{clusterId}/storageclasses/{storageClassName}',
        method: 'get',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
