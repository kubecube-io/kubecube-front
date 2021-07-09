import Service from '@micro-app/common/services/service.js';
const apis = {
    scan: {
        method: 'post',
        path: '/{clusterId}/repositories/scan'
    },
    loads: {
        method: 'get',
        path: '/{clusterId}/repositories/scanDetail',
    },
    loadLog: {
        method: 'get',
        path: '/{clusterId}/repositories/scanLog'
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
