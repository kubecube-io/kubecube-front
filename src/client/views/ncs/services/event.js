import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/events',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');
export default service;
