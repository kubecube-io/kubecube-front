import Service from '@micro-app/common/services/service.js';
import { normalizeWorkload, formatExternalWorkload } from '@micro-app/common/views/ncs/utils';

const apis = {
    create: {
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/deployments',
        method: 'post',
        noAlert: true,
    },
    load: {
        method: 'get',
        path: '/apps/clusters/{clusterId}/namespaces/{namespace}/deployments/{name}',
        process: (result) => {
            return normalizeWorkload(result);
        },
    },
    loadExternal: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/deployments/{name}',
        process: (result) => {
            return formatExternalWorkload(result);
        },
    },
    loads: {
        method: 'get',
        path: '/apps/clusters/{clusterId}/namespaces/{namespace}/deployments',
        process: (result) => {
            return (result.items || []).map((item) => normalizeWorkload(item));
        },
    },
    loadListWithPodInfos: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/deployments',
        process: (result) => {
            return {
                list: (result.Deployments || []).map((item) => normalizeWorkload(item)),
                total: result.Total || 0,
            };
        },
    },
    modify: {
        method: 'put',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/deployments/{name}',
    },
    delete: {
        noAlert: true,
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/deployments/{name}',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
