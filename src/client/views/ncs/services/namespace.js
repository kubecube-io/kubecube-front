import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces',
        // clusterId: 1,
    },
    loadsExternal: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces',
    },
    create: {
        method: 'post',
        path: '/extends/clusters/{clusterId}/namespace',
    },
    load: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespace/{nsName}',
    },
    modify: {
        method: 'put',
        path: '/extends/clusters/{clusterId}/namespace',
    },
    // 原生删除空间
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{nsName}',
    },
    deleteExternal: {
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespace/{nsName}',
    },
    // 一个项目同时关联多个空间
    link: {
        method: 'post',
        path: '/extends/project/namespaces',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs');

export default service;
