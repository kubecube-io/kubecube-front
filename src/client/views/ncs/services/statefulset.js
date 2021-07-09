import Service from '@micro-app/common/services/service.js';
import { normalizeWorkload, formatExternalWorkload } from '@micro-app/common/views/ncs/utils';
const apis = {
    create: {
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/statefulsets',
        method: 'post',
    },
    load: {
        method: 'get',
        path: '/apps/clusters/{clusterId}/namespaces/{namespace}/statefulsets/{name}',
        process: (result) => {
            return normalizeWorkload(result);
        },
    },
    loadExternal: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/statefulsets/{name}',
        process: (result) => {
            return formatExternalWorkload(result);
        },
    },
    loads: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/statefulsets',
        process: (result) => {
            return {
                list: result.statefulsets || [],
                total: result.total || 0,
            };
        },
    },
    modify: {
        method: 'put',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/statefulsets/{name}',
        noAlert: true,
    },
    delete: {
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/statefulsets/{name}',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
