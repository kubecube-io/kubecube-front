import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/nodes',
    },
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/nodes/{name}',
    },
    create: {
        method: 'post',
        path: '/extends/clusters/{clusterId}/nodes/initNode',
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/nodes/{name}',
    },
    loadsWithPage: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/nodes',
    },
    loadResource: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/nodes/schedulable/resources/allocatable',
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/nodes/{name}',
    },
    drain: {
        method: 'post',
        path: '/extends/clusters/{clusterId}/nodes/drainNode',
    }
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs');

export default service;
