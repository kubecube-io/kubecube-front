const prefixV2 = '/apm/redirect/api/v2/products/{tenantId}/{productId}';
export default {
    /**
     * 慢响应阈值设置(修改)接口
     */
    setStaticGradingRule: {
        path: prefixV2 + '/staticGradingRule',
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        dataType: 'form',
    },
    /**
     * 慢响应阈值读取接口
     */
    getStaticGradingRule: {
        path: prefixV2 + '/staticGradingRule',
        method: 'get',
    },
    /**
     * 慢SQL阈值设置(修改)接口(修改)接口
     */
    setSlowSqlRule: {
        path: prefixV2 + '/slowSqlRule',
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        dataType: 'form',
    },
    /**
     * 慢响应阈值读取接口
     */
    getSlowSqlRule: {
        path: prefixV2 + '/slowSqlRule',
        method: 'get',
    },
    /**
     * 增加日志信息接口
     * @param String kibanaEntrypoint  kibana域名或ip
     * @param String indexPattern   kibana indexPattern
     */
    addKibanaInfo: {
        path: prefixV2 + '/addKibanaInfo',
        method: 'post',
    },
    /**
     * 更新日志信息接口
     */
    updateKibanaInfo: {
        path: prefixV2 + '/updateKibanaInfo',
        method: 'get',
    },
    /**
     * 查询日志信息接口
     */
    getKibanaInfo: {
        path: prefixV2 + '/getKibanaInfo',
        method: 'get',
    },
    getSamplingRate: {
        path: prefixV2 + '/samplingRate',
        method: 'get',
    },
    setSamplingRate: {
        path: prefixV2 + '/samplingRate',
        method: 'post',
    },
    getCustomId: {
        path: prefixV2 + '/customId',
        method: 'get',
    },
    setCustomId: {
        path: prefixV2 + '/customId',
        method: 'post',
    },
    /**
     * 自定义方法
     */
    createCustomMethod: {
        path: prefixV2 + '/createCustomMethod',
        method: 'post',
    },
    updateCustomMethod: {
        path: prefixV2 + '/updateCustomMethod',
        method: 'post',
    },
    getCustomMethods: {
        path: prefixV2 + '/getCustomMethodList',
        method: 'get',
    },
    deleteCustomMethod: {
        path: prefixV2 + '/deleteCustomMethod',
        method: 'delete',
    },
};
