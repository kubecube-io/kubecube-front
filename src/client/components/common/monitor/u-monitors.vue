<template>
    <u-grid-layout-row v-if="chartOptions.length" :repeat="12" :class="$style.root">
        <u-grid-layout-column v-for="(item, index) in chartOptions" :key="item.title" :span="4" style="margin-bottom: 20px;">
            <u-monitor-chart-panel :ref="'chartPanel' + index" :class="$style.chart" height="320px" :contentStyle="item.contentStyle" type="ncs" :title="item.title" :unit="item.unit" :xAxis="xAxis" :yAxis="item.yAxis" :processor="item.processor" :metrics="item.metrics" :options="item.options">
                <template slot="titleTemplate" slot-scope="scope">
                        <div v-if="!scope.modal" style="text-align: left;">
                            <span >{{ chartOptions[index].title }} </span>
                            <div v-if="item.hasDevice" :class="$style.select">
                                <u-select size="mini small" v-if="devices.length" :key="listDisk" v-model="item.deviceName" :data="devices" @select="onSelect($event, index, key = 'deviceName')"></u-select>
                                <u-select size="mini small" v-else :key="noneDisk" :data="emptyDevices" disabled></u-select>
                            </div>
                            <div v-else-if="item.hasInterface" :class="$style.select">
                                <u-select size="mini small" v-if="interfaces.length" :key="listInterface" v-model="item.interfaceName" :data="interfaces" @select="onSelect($event, index, key = 'interfaceName')"></u-select>
                                <u-select size="mini small" v-else :key="noneInterface" :data="emptyInterfaces" disabled></u-select>
                            </div>
                        </div>
                        <!-- 展示工作负载的资源配置相关的信息 -->
                        <u-linear-layout v-if="item.extraInfos" style="text-align: center;margin-top: -10px;">
                            <span v-for="(item, index) in item.extraInfos" :key="index">{{ item.key }}:<span>{{ item.value }}</span> {{ item.suffix }}</span>
                        </u-linear-layout>
                </template>

                <template slot="headerTemplate" slot-scope="scope">
                    <u-monitor-optionbar v-bind="{timeRange:periodList, startTime, endTime, optionbarModules:['time'], noInterval: true}" @change="onModalChange($event, scope.change)"></u-monitor-optionbar>
                </template>
            </u-monitor-chart-panel>
        </u-grid-layout-column>
    </u-grid-layout-row>
</template>

<style module>
.chart {
    margin: 0 10px;
}
.root {
    margin-left: -10px;
    margin-right: -10px;
}
.select[class] {
    display: inline-block;
    padding-left: 10px;
}
</style>

<script>
import service from  '@micro-app/common/services/ncs';
import { getStep } from './filters';
import { POD_CHART_OPTIONS } from './chartOptions';
// 废弃：功能移动到@micro-app/ncs/components/global/u-monitors-ncs
export default {
    name: 'u-monitors',
    props: {
        defaultChartOptions: { type: Array, default: () => POD_CHART_OPTIONS },
        // 都是必填的参数
        clusterName: String,
        nsName: String,
        podName: String,
        containerName: String,

        startTime: [String, Number],
        endTime: [String, Number],
    },
    data() {
        return {
            chartOptions: [], // 所有chart的参数（一个chart的所有参数）的列表
            xAxis: { // x 轴展示相关的参数
                key: 'timestr',
                count: 3,
            },
            // 监控图上的磁盘选择相关参数
            deviceName: '', // 多个监控图的deviceName选择是独立的，此 deviceName 是给监控图初始化用的
            devices: [],
            emptyDevices: [{ text: '暂无磁盘' }],
            // 监控图上的网卡选择相关参数
            interfaceName: '',
            interfaces: [],
            emptyInterfaces: [{ text: '暂无网卡' }],
            // 时间选择空间相关数据，所有组件一般统一，如果需要自定制，后续提供props参数传递
            periodList: [
                { name: '近6小时', value: 360*60*1000 },
                { name: '近1天', value: 1440*60*1000 },
                { name: '近7天', value: 10080*60*1000 },
            ],
            loading: false,
        };
    },
    created() {
        // 下列的情形是四个参数同时传入组件内部
        if (this.clusterName && this.nsName && this.podName && this.containerName)
            this.loadInfo();

        // 下列的watch是针对于这四个参数不能同时传入组件内部的情形
        this.$watch(() => [this.clusterName, this.nsName, this.podName, this.containerName], (data) => {
            // 当四个参数都存在的时候才行
            if (data.every((item) => item))
                this.loadInfo();
        });
        this.$watch(() => [this.startTime, this.endTime], (data) => {
            if (!this.loading) {
                this.chartOptions = this.getChartOptions(this.chartOptions);
                this.$forceUpdate();
                this.$nextTick(() => this.$refresh());
            }
        });
    },
    methods: {
        formatTime(time) {
            return Math.floor(time / 1000);
        },
        onModalChange(event, next) {
            const { startTime, endTime } = event;
            const step = getStep(startTime, endTime);
            !this.loading && next({ start: this.formatTime(startTime), end: this.formatTime(endTime), step });
        },
        onSelect(event, index, key = 'deviceName') {
            const options = this.chartOptions[index];
            options[key] = event.value;
            this.chartOptions[index] = this.getChartOptions(options);
            this.$forceUpdate();
            this.$nextTick(() => {
                this.$refs[`chartPanel${index}`] && this.$refs[`chartPanel${index}`][0].refresh();
            });
        },
        /**
         * 让所有chart || 具体某个chart 刷新，暴露给外部
         * @param {number} index - chart的索引(不传或传的值不合法，则认为刷新全部)
         */
        $refresh(index) {
            index = parseInt(index);
            const length = this.chartOptions.length;
            const refreshAll = !(!isNaN(index) && index < length && index >= 0);
            this.chartOptions.forEach((item, i) => {
                if (!refreshAll && index !== i)
                    return;

                const chart = this.$refs[`chartPanel${i}`];

                if (chart && chart.length) {
                    // 对应有device或interface的监控图表，如果没有对应的deviceName或interfaceName，直接显示空态
                    if ((item.hasDevice && !item.deviceName) || (item.hasInterface && !item.interfaceName))
                        chart[0].refresh([]);
                    else
                        chart[0].refresh();
                }
            });
        },
        loadInfo() {
            this.loading = true;
            Promise.all([
                service.loadAllInfo({
                    name: 'disk_info',
                    dimension: 'container',
                    cluster: this.clusterName,
                    namespace: this.nsName,
                    pod_name: this.podName,
                    container_name: this.containerName,
                }),
                service.loadAllInfo({
                    name: 'network_info',
                    dimension: 'pod',
                    cluster: this.clusterName,
                    namespace: this.nsName,
                    pod_name: this.podName,
                }),
            ]).then((result) => {
                this.devices = (result[0] || []).map((item) => ({
                    text: item.metric.device,
                    value: item.metric.device,
                }));
                this.interfaces = (result[1] || []).map((item) => ({
                    text: item.metric.interface,
                    value: item.metric.interface,
                }));
                this.devices.length && (this.deviceName = this.devices[0].value);
                this.interfaces.length && (this.interfaceName = this.interfaces[0].value);
                this.loading = false;
                this.chartOptions = this.getChartOptions(this.defaultChartOptions);
                this.$nextTick(() => this.$refresh());
            });
        },
        getChartOptions(options) {
            const isArray = Array.isArray(options);
            options = isArray ? options : [options];
            const tmp = options.map((item, index) => {
                const extraOption = {};
                let metricKey = '';
                const deviceName = item.deviceName || this.deviceName;
                const interfaceName = item.interfaceName || this.interfaceName;

                if (item.hasDevice) {
                    extraOption.container_name = this.containerName;
                    extraOption.device = deviceName;
                    metricKey = deviceName;
                } else if (item.hasInterface) {
                    extraOption.interface = interfaceName;
                    metricKey = interfaceName;
                } else {
                    extraOption.container_name = this.containerName;
                    metricKey = this.containerName;
                }

                return {
                    options: Object.assign({
                        step: getStep(this.startTime, this.endTime),
                        // 固定30分钟
                        start: this.formatTime(this.startTime),
                        end: this.formatTime(this.endTime),
                        name: item.name, // 监控项
                        dimension: item.hasInterface ? 'pod' : 'container', // 维度
                        cluster: this.clusterName,
                        namespace: this.nsName,
                        pod_name: this.podName,
                    }, extraOption, item.options),
                    // 监控维度信息（对应每一条数据）
                    metrics: item.keys || [{
                        name: item.title,
                        key: metricKey,
                    }],
                    processor: item.processor,
                    unit: item.unit,
                    title: item.title,
                    name: item.name, // 监控项
                    hasDevice: item.hasDevice,
                    deviceName,
                    hasInterface: item.hasInterface,
                    interfaceName,
                    extraInfos: item.extraInfos,
                    contentStyle: item.extraInfos ? { top: '95px' } : {},
                    yAxis: {
                        min: 0,
                        name: '',
                        count: 2,
                    },
                };
            });
            return isArray ? tmp : tmp[0];
        },
    },
};
</script>
