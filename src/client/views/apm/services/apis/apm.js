import { prefixV1, prefix, prefixV1Products } from '../base.js';
const productPrefix = prefix + '/{product}';
export default {
    loads: {
        path: prefixV1Products + '/getProducts',
        method: 'get',
    },
    filterStatistics: {
        path: prefixV1 + '/statistics',
        method: 'get',
    },
    /**
     * 获取空间下监控数据概览
     */
    overview: {
        path: prefixV1 + '/productOverview/{productName}',
        method: 'get',
    },
    serviceOverview: {
        path: prefixV1 + '/{productId}/serviceOverview/{serviceNames}',
        method: 'get',
    },
    abnormalDetails: {
        path: prefixV1 + '/request/abnormalDetails',
        method: 'get',
    },
    statistics: {
        path: prefix + '/serviceOverview/{product}/statistics',
        method: 'get',
    },
    /**
     * 健康记录
     */
    health: {
        path: prefixV1 + '/health/abnormalDetails',
        method: 'get',
    },
    statisticsV1: {
        path: prefixV1 + '/statistics',
        method: 'get',
    },
    /**
     * 替换下面的 snapshot 接口， 20181108新增
     */
    getTraceList: {
        path: productPrefix + '/getTraceList',
        method: 'post',
    },
    /** 以下为20180531版本新增接口 **/
    /**
     * 快照
     */
    snapshot: {
        path: `${productPrefix}/snapshotList`,
        method: 'post',
    },
    /**
     * 获取业务请求展示项描述
     */
    businessTransactionDescription: {
        path: `${productPrefix}/getBusinessTransactionDescriptionList`,
        method: 'get',
    },
    /**
     * 业务请求
     */
    businessTransaction: {
        path: `${productPrefix}/businessTransactionList`,
        method: 'post',
    },
    /**
     * 所有请求
     */
    serviceEndpoint: {
        path: `${productPrefix}/serviceEndpointList`,
        method: 'post',
    },
    /**
     * 所有服务
     */
    services: {
        path: `${productPrefix}/services`,
        method: 'post',
    },
    /**
     * 所有服务与节点
     */
    nodes: {
        path: `${productPrefix}/nodes`,
        method: 'post',
        // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    /**
     * 获取用户agent
     */
    getAgent: {
        path: `/apm/redirect/api/v1/napm/userGuide/javaAgentConfig`,
        method: 'get',
    },
    createProduct: {
        path: `${prefixV1Products}/createProduct`,
        method: 'post',
    },
    // deleteProduct 与 updateProduct 内的 tenantId 传的是从 getProducts 列表里返回的 tenantId
    deleteProduct: {
        path: `/apm/redirect/api/v1/products/{tenantId}/deleteProduct/{productId}`,
        method: 'delete',
    },
    updateProduct: {
        path: `/apm/redirect/api/v1/products/{tenantId}/updateProduct/{productId}`,
        method: 'post',
    },
    trans: {
        path: `${prefix}/transactions/{transId}`,
        method: 'get',
    },
    /**
     * 数据报表
     */
    loadsReport: {
        path: `${prefixV1}/{productId}/describeDataReportInfos`,
        method: 'get',
    },
    updateReport: {
        path: `${prefixV1}/{productId}/updateDataReportInfo/{id}`,
        method: 'put',
    },
    deleteReport: {
        path: `${prefixV1}/{productId}/deleteDataReportInfo/{id}`,
        method: 'delete',
    },
    addReport: {
        path: `${prefixV1}/{productId}/addDataReportInfo`,
        method: 'post',
    },
    sendReport: {
        path: `${prefixV1}/{productId}/sendDataReportNow/{id}`,
        method: 'get',
    },
    getDeployType: {
        path: '/apm/redirect/api/v1/deployInfo/deployType',
        method: 'get',
    },
};
