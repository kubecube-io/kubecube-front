import { unit } from '@micro-app/common/filters';

const num = (value) => {
    const tmp = unit.size(value, 'B');
    // 保留两位小数
    // 返回对象：unit和num
    return tmp.getMinUnit(2);
};
export const sizeProcessor = function(result) {
    // this为monitor-chart
    const keys = this.metrics.map((item) => item.key);
    const max = Math.max.apply(null, _.flatten( result.map((item) => keys.map((key) => item[key])) ));
    const unit = num(isNaN(+max) ? 0 : max).unit || 'B';
    const multiple = Math.pow(1024, ['B', 'K', 'M', 'G', 'T', 'P'].indexOf(unit));
    this.unit = (unit === 'B' || !this.unit.startsWith('B')) ? this.unit : (unit + 'i' + this.unit);

    result.forEach((item) => {
        keys.forEach((key) => item[key] = (item[key] / multiple).toFixed(2));
    });
    return result;
};

export const getStep = (startTime, endTime) => {
    // 是否以秒为最小单位（一搬为毫秒）
    const isSecond = (endTime + '').length < 12;
    // period为min为单位
    let period = (endTime - startTime) / 60;
    !isSecond && (period = Math.floor(period / 1000));
    // 6h、24h、7d、30d
    const PERIOD_MAP = [0, 6 * 60, 24 * 60, 24 * 7 * 60, 30 * 24 * 60];
    const STEP_MAP = ['1m', '15m', '1h', '6h', '1d'];
    const index = PERIOD_MAP.findIndex((item, index, arr) => index < (arr.length - 1) ? (period >= item && period < arr[index + 1]) : true );

    return STEP_MAP[index];
};

/**
 * 获取请求中query部分的参数
 * @param {object} options - 具体chart的一些参数
 * @param {number} startTime - 起始时间【ms为最小单位】
 * @param {number} endTime - 结束时间【ms为最小单位】
 * @returns {object} - 请求参数对象
 * @description startTime 和 endTime 不放到 options对象内，是因为这两者获取经常是动态的。
 *              options放的是静态的配置信息。
 */
export const getQueryOptions = function(options, startTime, endTime) {
    const tmp = {
        step: '1m', // 默认1m,【1m, 15m, 1h, 6h, 1d】
        // 必填
        start: Math.floor(startTime / 1000), // 起始时间【s为最小单位】
        end: Math.floor(endTime / 1000), // 结束时间【s为最小单位】
        name: '', // 监控项名称
        dimension: '', // 维度
        // 非必填
        cluster: '', // 集群名称
        node_name: '', // 节点名称
        namespace: '',
        pod_name: '',
        container_name: '',
        filter_label: '', // 一般不传，当一个接口返回多个监控项时，传 type。对应chart的基础配置有keys，具体key值由后端定义，前端适配
        device: '',
        interface: '',
    };

    Object.assign(tmp, options, { step: getStep(startTime, endTime) });
    // 用omitBy筛选掉对应属性值为空的属性
    return _.omitBy(tmp, (value) => !value);
};
