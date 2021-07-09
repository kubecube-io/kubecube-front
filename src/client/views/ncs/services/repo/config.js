import Service from '@micro-app/common/services/service.js';

const apis = {
    loads: {
        method: 'get',
        path: '/config/harbor',
    },
    create: {
        method: 'post',
        path: '/config/harbor',
    },
    modify: {
        method: 'put',
        path: '/config/harbor',
    },
    delete: {
        method: 'delete',
        path: '/config/harbor',
    },
    ping: {
        method: 'post',
        path: '/config/ping',
    },
    loadStatus: {
        method: 'get',
        path: '/stats',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
