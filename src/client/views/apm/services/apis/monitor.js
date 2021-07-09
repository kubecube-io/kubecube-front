import { prefixV1, prefix } from '../base.js';
const productPrefix = prefix + '/{product}';
export default {
    /** 以下为20180531版本新增接口 **/
    topo: {
        path: `${productPrefix}/productFlowMap`,
        method: 'post',
    },
    serviceTopo: {
        path: `${productPrefix}/serviceFlowMap/{service}`,
        method: 'post',
    },
    /**
     * 所有节点－监测图表描述
     */
    chartList: {
        path: `${productPrefix}/getMetricChartDescriptionList`,
        method: 'get',
    },
    /**
     * 所有节点－监测图表
     */
    metricData: {
        path: `${productPrefix}/getMetricData`,
        method: 'post',
    },
    descriptionList: {
        path: `${productPrefix}/getHeapStatus`,
        method: 'post',
    },
    getMonitorData: {
        path: `${prefixV1}/metricData`,
        method: 'get',
    },
};
