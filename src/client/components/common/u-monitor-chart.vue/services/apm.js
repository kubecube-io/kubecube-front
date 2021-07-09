import apmMonitorService from '@micro-app/common/views/apm/services/monitor';
import ncsMonitorService from '@micro-app/common/views/ncs/services/monitor';
import zipkinMonitorService from '@micro-app/common/views/apm/services/trace';
import { date } from '@necfe/cloud-ui-internal/src/filters.js';

function handleMetricDataResult(results, sTime, eTime) {
    const data = {};
    results.forEach((obj) => {
        let anomalyList = [];
        if (obj.result.anomalyTimeslices) {
            anomalyList = obj.result.anomalyTimeslices.reduce((list, item) => list.concat(item), []);
            anomalyList = [...new Set(anomalyList)];
        }
        obj.result.dataTimeslices && obj.result.dataTimeslices.forEach((item) => {
            const timestamp = new Date(item.startTime);
            const value = item.metricValue;
            if (!data[timestamp]) {
                data[timestamp] = {
                    datetime: date.dateFormat(timestamp, 'yyyy-MM-dd HH:mm:ss'),
                    timestr: date.dateFormat(timestamp, 'HH:mm'),
                    timestamp,
                };
            }
            data[timestamp][obj.key] = value.toFixed(3);
            if (anomalyList.includes(item.startTime)) {
                data[timestamp].special = {
                    [obj.key]: { color: '' },
                };
            }
        });
    });
    let times = Object.keys(data).sort((a, b) => {
        const before = new Date(a);
        const after = new Date(b);
        return before - after;
    });
    // debugger;
    const startTime = new Date(times[0]).getTime();
    const endTime = new Date(times[times.length - 1]).getTime();
    const periodTime = (endTime - startTime) / (times.length - 1);

    const haveTime = endTime - startTime;
    const needTime = eTime - sTime;
    if (needTime - haveTime > periodTime) {
        // 如果数据未请求到足够的时间，向前补空位
        let difference = needTime - haveTime;
        const fillTime = [];
        while (difference > 0) {
            const leftTime = difference - periodTime;
            const time = (fillTime[0] || startTime) - (leftTime >= 0 ? periodTime : difference);
            fillTime.unshift(time);
            data[time] = {
                datatime: date.dateFormat(time, 'yyyy-MM-dd HH:mm:ss'),
                timestr: date.dateFormat(time, 'HH:mm'),
                timestamp: time,
            };
            difference = difference - periodTime;
        }
        times = [...fillTime, ...times];
    }
    return times.map((time) => data[time]);
}
// 旧的获取apm monitor接口, 已废弃
export function getApmMonitor(data) {
    const {
        filters,
        options,
        metrics,
        period,
    } = data;
    return apmMonitorService.getMonitorData({
        query: {
            timePeriod: period,
            filters: JSON.stringify(filters),
            metrics: metrics.map((metric) => metric.key).join(','),
            productId: filters.productId,
        },
    }).then((result) => {
        const data = result.result.map((item) => Object.assign({
            timestamp: item.timestamp,
        }, item.data[0]));
        return data;
    });
}
export function getApmJvm(data) {
    const {
        filters,
        options,
        metrics,
    } = data;
    const keys = metrics.map((metric) => metric.key);
    let entityType = 'PRODUCT';
    if (options.service)
        entityType = 'SERVICE';
    if (options.nodeId)
        entityType = 'NODE';
    if (options.business)
        entityType = 'BUSINESS';
    const promises = keys.map((key) => apmMonitorService.metricData({
        product: options.productId,
        body: {
            metricDataQuery: {
                entityType,
                entity: {
                    service: options.service,
                    node: options.nodeId,
                    path: options.business,
                },
                metricId: key,
            },
            timeRangeSpecifier: {
                type: 'BETWEEN_TIMES',
                startTime: options.startTime,
                endTime: options.endTime,
            },
        },
    }).then((result) => ({
        key,
        result,
    })));
    return Promise.all(promises).then((results) => handleMetricDataResult(results, options.startTime, options.endTime));
}

export function getApmService(data) {
    const {
        filters,
        options,
        metrics,
    } = data;
    const keys = metrics.map((metric) => metric.key);
    let entityType = 'PRODUCT';
    if (options.service)
        entityType = 'SERVICE';
    if (options.nodeId)
        entityType = 'NODE';
    const promises = keys.map((key) => apmMonitorService.metricData({
        product: options.productId,
        body: {
            metricDataQuery: {
                entityType,
                entity: options.entity,
                metricId: key,
            },
            timeRangeSpecifier: {
                type: 'BETWEEN_TIMES',
                startTime: options.startTime,
                endTime: options.endTime,
            },
        },
    }).then((result) => ({
        key,
        result,
    })));
    return Promise.all(promises).then((results) => handleMetricDataResult(results, options.startTime, options.endTime));
}

export function getNcsMonitor({ options, metrics }) {
    // todo: 多个请求的方式还需调整
    // return Promise.all(options.map((item) => ncsMonitorService.loadRange(item))).then((results) => {
    //     if(results.length === 1) {
    //         return _.get(results[0], 'data.samples', []);
    //     } else if(results.length > 1) {
    //         const tmp = Array.from({ length: results[0].data.samples.length}).fill({});
    //         results.forEach((result, index) => {
    //             result.data.samples.forEach((item, subIndex) => {
    //                 // todo: 这里的 1 的获取方式要改
    //                 tmp[subIndex][metrics[index].key] = item['1'];
    //             })
    //         });
    //         return tmp;
    //     } else
    //         return [];
    // });
    return ncsMonitorService.loadRange({
        ...options,
    }).then(({ data }) => data.samples || []);
}

export function getApmDb(data) {
    const {
        filters,
        options,
        metrics,
    } = data;
    const keys = metrics.map((metric) => metric.key);
    const entityType = 'BACKEND';
    const promises = keys.map((key) => apmMonitorService.metricData({
        product: options.productId,
        body: {
            metricDataQuery: {
                entityType,
                entity: {
                    dbType: options.dbType,
                    dbInstance: options.dbInstance,
                },
                metricId: key,
            },
            timeRangeSpecifier: {
                type: 'BETWEEN_TIMES',
                startTime: options.startTime,
                endTime: options.endTime,
            },
        },
    }).then((result) => ({
        key,
        result,
    })));
    return Promise.all(promises).then((results) => handleMetricDataResult(results, options.startTime, options.endTime));
}

export function getZipkinMonitor({ options }) {
    return zipkinMonitorService.getMetrics({
        ...options,
    }).then(({ data }) => data.map((metric) => Object.assign({}, metric, {
        avgLatency: (metric.avgLatency / 1000).toFixed(3),
        p95AvgLatency: (metric.p95AvgLatency / 1000).toFixed(3),
        p99AvgLatency: (metric.p99AvgLatency / 1000).toFixed(3),
        startTime: +new Date(metric.startTime).getTime(),
        timestamp: +new Date(metric.startTime).getTime(),
    })));
}
