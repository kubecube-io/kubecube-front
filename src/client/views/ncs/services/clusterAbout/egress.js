import Service from '@micro-app/common/services/service.js';
const apis = {
    create: {
        method: 'post',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy',
        noAlert: true,
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy',
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy',
    },
    // 查询集群是否存在关联的Openshift 网络策略，如果存在，返回具体信息
    check: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy/checkorget',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;

