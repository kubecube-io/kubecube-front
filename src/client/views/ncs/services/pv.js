import Service from '@micro-app/common/services/service.js';

const apis = {
    // todo
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/persistentvolumes/{name}',
    },
    loads: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/storage/persistentvolumes',
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/persistentvolumes/{name}',
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/persistentvolumes/{name}',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
