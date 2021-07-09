import Service from '@micro-app/common/services/service.js';
import { normalizeSecret } from '@micro-app/common/views/ncs/utils';

const apis = {
    create: {
        method: 'post',
        path: '/clusters/{clusterId}/namespaces/{namespace}/secrets',
    },
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/secrets/{name}',
        process: (result) => normalizeSecret(result),
    },
    // common
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/secrets',
        process: (result) =>
            // 不暴露kubernetes.io/service-account-token这种类型的secret
             (result.items || [])
                .filter((item) => item.type !== 'kubernetes.io/service-account-token')
                .map((item) => normalizeSecret(item))
        ,
    },
    loadsWithPage: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/secrets',
        process: (result) => {
            // 不暴露kubernetes.io/service-account-token这种类型的secret
            const list = (result.secrets || [])
                .filter((item) => item.type !== 'kubernetes.io/service-account-token')
                .map((item) => normalizeSecret(item));
            return {
                list,
                total: result.total || 0,
            };
        },
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{namespace}/secrets/{name}',
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/namespaces/{namespace}/secrets/{name}',
    },
};
// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs');

export default service;
