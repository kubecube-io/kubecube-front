<template>
    <u-grid-layout-row v-if="chartOptions.length" :repeat="12" :class="$style.root">
        <u-grid-layout-column v-for="(item, index) in chartOptions" :key="item.title" :span="4" style="margin-bottom: 20px;">
            <u-monitor-chart-panel :ref="'chartPanel' + index" :class="$style.chart" height="320px" :contentStyle="item.contentStyle" type="ncs" :title="item.title" :unit="item.unit" :xAxis="xAxis" :yAxis="item.yAxis" :processor="item.processor" :metrics="item.metrics" :options="item.options">
                <template slot="titleTemplate" slot-scope="scope">
                        <div v-if="!scope.modal" style="text-align: left;">
                            <span >{{ chartOptions[index].title }} </span>
                            <div v-if="item.hasDevice" :class="$style.select">
                                <!-- 这里 options.device 是对应接口请求中的磁盘名称 -->
                                <u-select size="mini small" v-if="devices.length" key="listDevice" v-model="item.options.device" :data="devices" @select="onSelect($event, index, key = 'device')"></u-select>
                                <u-select size="mini small" v-else key="noneDevice" :data="emptyDevices" disabled></u-select>
                            </div>
                            <div v-else-if="item.hasInterface" :class="$style.select">
                                <!-- 这里 options.interface 是对应接口请求中的网卡名称 -->
                                <u-select size="mini small" v-if="interfaces.length" key="listInterface" v-model="item.options.interface" :data="interfaces" @select="onSelect($event, index, key = 'interface')"></u-select>
                                <u-select size="mini small" v-else key="noneInterface" :data="emptyInterfaces" disabled></u-select>
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
import Vue from 'vue';
import service from  '@micro-app/common/services/ncs';
import { getStep, getQueryOptions, sizeProcessor } from './filters';
import { POD_CHART_OPTIONS } from './chartOptions';
// 废弃：功能移动到@micro-app/ncs/components/global/u-monitors-ncs
export default {
    name: 'u-monitors-enhance',
    props: {
        defaultChartOptions: { type: Array, default: () => POD_CHART_OPTIONS },
        queryOptionsList: { type: Array, default: () => ([]) }, // 多个chart的请求参数列表
        startTime: [String, Number],
        endTime: [String, Number],
        devices: { type: Array, default: () => ([]) }, // 磁盘列表
        interfaces: { type: Array, default: () => ([]) },
        // loading: { type: Boolean, default: false }, 
    },
    data() {
        return {
            chartOptions: [], // 所有chart的参数（一个chart的所有参数）的列表
            xAxis: { // x 轴展示相关的参数
                key: 'timestr',
                count: 3,
            },
            currentDefaultChartOptions: this.defaultChartOptions,
            currentQueryOptionsList: this.queryOptionsList,
            // 监控图上的磁盘选择相关参数
            // deviceName: '', // 多个监控图的deviceName选择是独立的，此 deviceName 是给监控图初始化用的
            // devices: [],
            emptyDevices: [{ text: '暂无磁盘' }],
            // 监控图上的网卡选择相关参数
            // interfaceName: '',
            // interfaces: [],
            emptyInterfaces: [{ text: '暂无网卡' }],
            // 时间选择空间相关数据，所有组件一般统一，如果需要自定制，后续提供props参数传递
            periodList: [
                { name: '近6小时', value: 360*60*1000 },
                { name: '近1天', value: 1440*60*1000 },
                { name: '近7天', value: 10080*60*1000 },
            ],
            loading: false, // todo: 暂时没用
        };
    },
    created() {
        this.$watch(() => [ this.startTime, this.endTime ], (data) => {
            if(!this.loading) {
                this.chartOptions.forEach((item, index) => Vue.set(item, 'options', getQueryOptions(Object.assign({ name: item.name, filter_label: item.keys ? 'type' : '', }, this.currentQueryOptionsList[index]), this.startTime, this.endTime)) );
                this.$nextTick(() => this.$refresh());
            }
        });
    },
    methods: {
        // 外界的参数【主要是异步】获取到之后，手动调用此函数执行初始化操作
        init() {
            this.loading = false;
            this.watchDevices();
            this.chartOptions = this.currentDefaultChartOptions.map((item, index) => this.getChartOptions(this.currentDefaultChartOptions[index], this.currentQueryOptionsList[index]));
            this.$nextTick(() => this.$refresh());
        },
        // devices 更新时，同步更新每个chart中的 device 为列表第一项
        watchDevices() {
            if(this.devices.length) {
                this.currentDefaultChartOptions.forEach((item) => item.hasDevice && (item.key = this.devices[0].value));
                this.currentQueryOptionsList.forEach((item, index) => this.currentDefaultChartOptions[index].hasDevice && (item.device = this.devices[0].value));
            } else {
                // 不同步currentDefaultChartOptions && currentQueryOptionsList
                this.chartOptions.forEach((item) => {
                    Vue.set(item.options, 'device', undefined);
                });
            }
        },
        formatTime(time) {
            return Math.floor(time / 1000);
        },
        onModalChange(event, next) {
            const { startTime, endTime } = event;
            const step = getStep(startTime, endTime);
            !this.loading && next({ start: this.formatTime(startTime), end: this.formatTime(endTime), step });
        },
        onSelect(event, index, key = 'device') {
            // 同步currentDefaultChartOptions && currentQueryOptionsList
            this.currentDefaultChartOptions[index].key = event.value;
            this.currentQueryOptionsList[index].device = event.value;
            // 更新 chartOptions
            Vue.set(this.chartOptions, index, this.getChartOptions(this.currentDefaultChartOptions[index], this.currentQueryOptionsList[index]));
            // 刷新对应的图表
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
                if(!refreshAll && index !== i)
                    return;

                const chart = this.$refs[`chartPanel${i}`];

                if (chart && chart.length) {
                    // 对应有device或interface的监控图表，如果没有对应的device或interface，直接显示空态
                    if((item.hasDevice && !item.options.device) || (item.hasInterface && !item.options.interface))
                        chart[0].refresh([]);
                    else
                        chart[0].refresh();
                }
            });
        },
        /**
         * 获取单个chart的options
         * @param {object} options - chart(渲染)相关的参数
         * @param {object} queryOptions - chart相关请求需要的参数【 不传 step，start，end，name 】
         * @returns {object}
         */
        getChartOptions(options, queryOptions) {
            const yAxis = { min: 0, name: '', count: 3 };
            // 以 % 为单位的监控图标，设置y轴 max 为 100，count 为 5
            options.unit === '%' && Object.assign(yAxis, { max: 100, count: 5 });
            options = Object.assign({ 
                yAxis,
                // 如果options有指定processor，会直接覆盖默认的
                // 给unit以B开头（B, B/s等）的chart，添加默认的sizeProcessor
                processor: options.unit && options.unit.startsWith('B') ? sizeProcessor : undefined,
            }, options);
            // keys的每项【key】是一个对象，有属性 value，text。如果每项都是字符串，则认为value === text
            // key属性为字符串(即指定对应的value属性），text默认为options.title
            const metrics = options.keys
                ? options.keys.map((item) => typeof item === 'string' ? { name: item, key: item } : { name: item.text, key: item.value })
                : [{ name: options.title, key: options.key }];
            return {
                options: getQueryOptions(Object.assign({
                    name: options.name,
                    filter_label: options.keys ? 'type' : '',
                }, queryOptions), this.startTime, this.endTime),
                // 监控维度信息（对应每一条数据）
                metrics,
                ...options,
            };
        },
    },
}
</script>


