import Service from '@micro-app/common/services/service.js';

const apis = {
    load: {
        path: '/clusters/{clusterId}/namespaces/{namespace}/persistentvolumeclaims/{name}',
        method: 'get',
    },
    loads: {
        path: '/extends/clusters/{clusterId}/storage/namespaces/{namespace}/persistentvolumeclaims',
        method: 'get',
    },
    create: {
        path: '/clusters/{clusterId}/namespaces/{namespace}/persistentvolumeclaims',
        method: 'post',
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/namespaces/{namespace}/persistentvolumeclaims/{name}',
    },
    delete: {
        path: '/clusters/{clusterId}/namespaces/{namespace}/persistentvolumeclaims/{name}',
        method: 'delete',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
