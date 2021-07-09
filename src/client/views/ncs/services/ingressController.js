import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/ingresscontrollers/addresses',
    },

};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs');

export default service;
