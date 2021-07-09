import Service from '@micro-app/common/services/service.js';

const apis = {
    // 部署
    create: {
        method: 'post',
        path: '/clusters/{clusterId}/helm/releases',
        noAlert: true,
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/helm/releases/{releaseName}',
    },
    // 查询所有集群下
    loads: {
        method: 'get',
        path: '/helm/releases',
    },
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/helm/releases/{release}/basicinfo',
    },
    loadResources: {
        method: 'get',
        path: '/clusters/{clusterId}/helm/releases/{release}/revision/{revision}/resources',
    },
    loadConfig: {
        method: 'get',
        path: '/clusters/{clusterId}/helm/releases/{release}/values',
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/helm/releases/{release}',
        noAlert: true,
    },
    rollback: {
        method: 'get',
        path: '/clusters/{clusterId}/helm/releases/{release}/rollback',
    },
    loadHistories: {
        method: 'get',
        path: '/clusters/{clusterId}/helm/releases/{release}/history',
    },
    loadLog: {
        method: 'get',
        path: '/clusters/{clusterId}/helm/releases/{release}/description',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
