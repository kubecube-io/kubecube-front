const prefix = '/apm/redirect/api/v1/products/{tenantId}/{productId}';
const prefixV2 = '/apm/redirect/api/v2/products/{tenantId}/{productId}';
export default {
    /**
     * 服务列表接口
     */
    getServices: {
        path: prefix + '/serviceOverview',
        method: 'get',
    },
    /**
     * 获取服务异常列表
     */
    getExceptionList: {
        path: prefixV2 + '/exceptionOverview/{serviceName}',
        method: 'get',
    },
    /**
     * 获取服务异常详情
     */
    getException: {
        path: prefixV2 + '/getMetricData',
        method: 'post',
    },
    /**
     * 查询服务 API 监控数据
     */
    getApiMonitor: {
        path: prefixV2 + '/serviceEndpointList',
        method: 'post',
    },
    /**
     * 获取容器监控关联 node 信息
     */
    getNodeInfo: {
        path: prefixV2 + '/nodes',
        method: 'post',
    },
};
