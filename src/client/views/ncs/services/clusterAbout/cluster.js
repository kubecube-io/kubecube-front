import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/clusters',
    },
    load: {
        method: 'get',
        path: '/clusters/{clusterId}',
    },
    loadSimple: {
        method: 'get',
        path: '/clusters/prune',
    },
    create: {
        path: '/clusters',
        method: 'post',
    },
    modify: {
        path: '/clusters/{clusterId}',
        method: 'put',
    },
    check: {
        path: '/clusters/check',
        method: 'post',
    },
    // todo
    addRepoSecret: {
        path: '/secret/harbor/project',
        method: 'post',
    },
    loadLog: {
        path: '/clusters/{clusterId}/records',
        method: 'get',
    },
    loadDrainNodeLog: {
        path: '/clusters/{clusterId}/records/drainNode',
        method: 'get',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
