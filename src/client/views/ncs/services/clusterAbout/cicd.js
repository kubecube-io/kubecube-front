import Service from '@micro-app/common/services/service.js';
const apis = {
    load: {
        path: '/cicd/project/{project}',
        method: 'get',
    },
    modify: {
        path: '/cicd/project',
        method: 'post',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
