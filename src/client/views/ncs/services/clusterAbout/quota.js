import Service from '@micro-app/common/services/service.js';
const apis = {
    load: {
        path: '/clusters/{clusterId}/quota/{resource}',
        method: 'get',
    },
    modify: {
        path: '/clusters/{clusterId}/quota',
        method: 'post',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
