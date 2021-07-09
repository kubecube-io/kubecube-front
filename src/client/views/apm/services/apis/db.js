const prefix = '/apm/redirect/api/v1/products/{tenantId}/{productId}';
const prefixV2 = '/apm/redirect/api/v2/products/{tenantId}/{productId}';
export default {
    /**
     * 数据库列表接口
     */
    getDbs: {
        path: prefix + '/dbOverview',
        method: 'get',
    },
    /**
     * 慢SQL查询接口
     */
    getSlowSql: {
        path: prefixV2 + '/slowSqlOverview',
        method: 'get',
    },
    /**
     *  慢 SQL 详情散点图接口
     */
    getSlowSqlDetail: {
        path: prefixV2 + '/slowSqlScatterPlot',
        method: 'post',
    },
};
