import Service from '@micro-app/common/services/service.js';

const apis = {
    create: {
        path: '/{clusterId}/policies/create',
        method: 'post',
        noAlert: true,
    },
    loads: {
        method: 'post',
        path: '/{clusterId}/policies/list',
        process: (result) => {
            return {
                list: result.policies,
                total: result.total,
            };
        },
    },
    load: {
        method: 'get',
        path: '/{clusterId}/policies/{policyId}',
    },
    modify: {
        method: 'put',
        path: '/{clusterId}/policies/{policyId}/update',
    },
    delete: {
        method: 'delete',
        path: '/{clusterId}/policies/{policyId}',
    },
    run: {
        method: 'post',
        path: '/{clusterId}/policies/{policyId}/run',
    }
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
