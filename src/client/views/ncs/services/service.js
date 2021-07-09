import Service from '@micro-app/common/services/service.js';
import { normalizeService } from '@micro-app/common/views/ncs/utils';
const apis = {
    create: {
        method: 'post',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services',
    },
    loads: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services',
        process: (result) => {
            return {
                total: result.total || 0,
                list: (result.items || []).map((item) => normalizeService(item)),
            };
        },
    },
    loadAll: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services',
        limit: 1000,
        process: (result) => {
            return {
                total: result.total || 0,
                list: (result.items || []).map((item) => normalizeService(item)),
            };
        },
    },
    load: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services/{name}',
        process: (result) => {
            return normalizeService(result);
        },
    },
    modify: {
        method: 'put',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services/{name}',
    },
    delete: {
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services/{name}',
    },
    loadExternal: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services/{name}/externalAccess',
    },
    setExternal: {
        noAlert: true,
        method: 'put',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services/{name}/externalAccess',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
