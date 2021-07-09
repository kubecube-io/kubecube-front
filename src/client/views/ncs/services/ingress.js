import Service from '@micro-app/common/services/service.js';
import { normalizeIngress } from '@micro-app/common/views/ncs/utils';
const apis = {
    create: {
        method: 'post',
        path: '/extensions/clusters/{clusterId}/namespaces/{namespace}/ingresses',
    },
    loads: {
        method: 'get',
        path: '/extensions/clusters/{clusterId}/namespaces/{namespace}/ingresses',
        process: (result = {}) => {
            return (result.items || []).map((item) => normalizeIngress(item));
        },
    },
    loadsWithPage: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/ingresses',
        process: (result) => {
            return {
                total: result.total || 0,
                list: (result.ingresses || []).map((item) => normalizeIngress(item)),
            };
        },
    },
    load: {
        method: 'get',
        path: '/extensions/clusters/{clusterId}/namespaces/{namespace}/ingresses/{name}',
        process: (result) => {
            return normalizeIngress(result);
        },
    },
    delete: {
        method: 'delete',
        path: '/extensions/clusters/{clusterId}/namespaces/{namespace}/ingresses/{name}',
    },
    modify: {
        method: 'put',
        path: '/extensions/clusters/{clusterId}/namespaces/{namespace}/ingresses/{name}',
    }
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
