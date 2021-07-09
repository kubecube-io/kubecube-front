import Service from '@micro-app/common/services/service.js';
import { normalizeConfigMap } from '@micro-app/common/views/ncs/utils';
const apis = {
    // common
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/configmaps',
        process: (result) => (result.items || []).map((item) => normalizeConfigMap(item)),
    },
    loadsWithPage: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/configmaps',
        process: (result) => ({
                list: result.configmaps || [],
                total: result.total || 0,
            }),
    },
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/configmaps/{name}',
        process: (result) => normalizeConfigMap(result),
    },
    create: {
        method: 'post',
        path: '/clusters/{clusterId}/namespaces/{namespace}/configmaps',
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/namespaces/{namespace}/configmaps/{name}',
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{namespace}/configmaps/{name}',
    },

};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs');

export default service;
