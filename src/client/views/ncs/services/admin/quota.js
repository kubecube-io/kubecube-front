import Service from '@micro-app/common/services/service.js';
const apis = {
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/quota/tenant',
    },
    modify: {
        method: 'post',
        path: '/clusters/{clusterId}/quota/tenant',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
