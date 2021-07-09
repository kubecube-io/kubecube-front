import Service from '@micro-app/common/services/service.js';

const apis = {
    loads: {
        method: 'post',
        path: '/{clusterId}/jobs/list',
        process: (result = {}) => {
            return {
                total: result.total || 0,
                list: result.jobs || [],
            };
        },
    },

    modify: {
        method: 'put',
        path: '/{clusterId}/jobs/update',
    },
    delete: {
        method: 'delete',
        path: '/{clusterId}/jobs/{jobId}',
    },
    loadLog: {
        method: 'get',
        path: '/{clusterId}/jobs/{jobId}/log',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
