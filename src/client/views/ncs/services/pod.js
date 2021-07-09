import Service from '@micro-app/common/services/service.js';
import { normalizePod } from '@micro-app/common/views/ncs/utils';
const apis = {
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/pods/{name} '
    },
    loadPods: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/pods',
        process: (result) => {
            return (result.items || {}).map((item) => normalizePod(Object.assign({}, {
                kind: result.kind,
                apiVersion: result.apiVersion,
            }, item)));
        },
    },
    loadNodePods: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/pods',
        process: (result) => {
            return {
                total: result.total || 0,
                list: (result.pods || []).map((item) => normalizePod(item)),
            };
        },
    },
    deleteNodePod: {
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/pods/{pod}',
    },
    deleteWorkloadPod: {
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/workloads/pods/{pod}',
    },
    // namespace下的pod列表，支持排序
    loadExternalPods: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/pods',
        process: (result) => {
            return {
                total: result.total || 0,
                list: (result.pods || []).map((item) => normalizePod(item)),
            };
        },
    },
    loadExternalPod: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/pods/{pod}',
    },
    delete: {
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/podview/pods/{pod}',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
