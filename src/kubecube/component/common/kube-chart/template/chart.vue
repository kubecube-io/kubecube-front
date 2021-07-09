<template>
  <div>
    <div
      v-show="nodata"
      style="height:290px"
      :class="$style.empty"
    />
    <x-echarts
      v-show="!nodata"
      ref="chart"
      :style="`height:${height}px`"
      :options="chartOption"
      autoresize
    />
  </div>
</template>

<script>
import { get, flatten } from 'lodash';
import XEcharts from '@cloud-ui/x-echarts.vue';
import monitorService from 'kubecube/services/monitor';
import { getStep, getStepTime } from 'kubecube/utils/functional';
export default {
    components: {
        'x-echarts': XEcharts,
    },
    props: {
        chartType: {
            type: String,
            default: 'line',
        },
        startTime: Number,
        endTime: Number,
        formatTime: {
            type: Function,
            default: t => t / 1000,
        },
        query: Array,
        legendTemplate: Array,
        height: {
            type: [ Number, String ],
            default: '100%',
        },
    },
    data() {
        return {
            chartOption: null,
            nodata: false,
            flag: true,

            currPromise: null,
        };
    },
    computed: {
        st() {
            return this.formatTime(this.startTime);
        },
        et() {
            return this.formatTime(this.endTime);
        },
        step() {
            return getStep(this.startTime, this.endTime);
        },
        stepTime() {
            return getStepTime(this.startTime, this.endTime);
        },
    },
    created() {
        this.currPromise = this.loadChart();
    },
    mounted() {
        [ 'st', 'et', 'metric', 'query' ].forEach(k => {
            this.$watch(k, this.raceRefresh);
        });
    },
    methods: {
        raceRefresh(useLoading) {
            if (!this.flag) return;
            this.flag = false;
            requestAnimationFrame(() => {
                this.flag = true;
                this.currPromise = this.loadChart(useLoading);
            });
        },
        loadChart(useLoading) {
            if (useLoading) this.$refs.chart.showLoading();
            if (!this.query || !this.query.length) {
                this.nodata = true;
                return;
            }
            console.log(this.step);
            const promise = Promise.all(this.query.map(q =>
                monitorService.queryRange({
                    params: {
                        query: q,
                        start: this.st,
                        end: this.et,
                        step: this.step,
                    },
                }))).then(response => {
                if (this.currPromise !== promise) return;
                if (useLoading) this.$refs.chart.hideLoading();

                const length = response.reduce((a, r) => get(r, 'data.result.length', 0), 0);
                if (length === 0) {
                    this.nodata = true;
                    return;
                }

                const data = flatten(response.map((r, idx) => get(r, 'data.result', []).map(r => ({
                    ...r,
                    legendTemplate: this.legendTemplate[idx],
                }))));

                const series = [];
                let legend = [];

                data.forEach(({ legendTemplate, values, metric }) => {
                    const name = legendTemplate(metric);
                    legend.push(name);
                    series.push({
                        type: this.chartType,
                        smooth: true,
                        name,
                        data: values.map(i => i && ([ i[0] * 1000, +i[1] ])),
                        symbol: 'none',
                        areaStyle: {
                            opacity: 0.1,
                        },
                    });
                });
                legend = {
                    type: 'scroll',
                    data: legend.map(name => ({
                        name,
                        icon: 'rect',
                    })),
                    bottom: 10,
                    itemWidth: 5,
                    itemHeight: 5,
                };
                this.chartOption = {
                    legend,
                    yAxis: {
                        type: 'value',
                        splitNumber: 4,
                        axisLabel: {
                            formatter(value) {
                                return new Intl.NumberFormat('en-GB', { notation: 'compact', compactDisplay: 'short' }).format(value);
                            },
                        },
                        nameGap: 5,
                        name: '',
                    },
                    xAxis: {
                        type: 'time',
                        // data: xData,
                        nameTextStyle: {
                            width: '20',
                        },
                        splitLine: {
                            show: false,
                        },

                    },
                    series,
                    tooltip: {
                        appendToBody: true,
                        trigger: 'axis',
                        axisPointer: { // 坐标轴指示器，坐标轴触发有效
                            type: 'line', // 默认为直线，可选为：'line' | 'shadow'
                        },
                    },
                    grid: {
                        left: 42,
                        top: 24,
                        borderColor: '#eee',
                    },
                };

                // const metrics = result.map(r => r.metric);
                // const datas = result.map(r => r.values);

                // const series = getSeries(
                //     this.chartType,
                //     datas,
                //     metrics,
                //     this.legendTemplate,
                //     this.stepTime);
                // const legend = resolveLegend(
                //     this.legendTemplate,
                //     metrics);

                // this.chartOption = {
                //     legend,
                //     ...getAxis(datas, this.metric.unit),
                //     series,
                //     tooltip: {
                //         appendToBody: true,
                //         trigger: 'axis',
                //         axisPointer: { // 坐标轴指示器，坐标轴触发有效
                //             type: 'line', // 默认为直线，可选为：'line' | 'shadow'
                //         },
                //     },
                //     grid: {
                //         left: 42,
                //         top: 24,
                //         borderColor: '#eee',
                //     },
                // };
                // this.postModifyOptions(metrics, datas);
                this.nodata = false;
                this.currPromise = null;
            });

            return promise;
        },
        postModifyOptions() {
            return this.chartOption;
        },
    },
};
</script>

<style module>
.empty{
    background: url('cloud-ui.vusion/src/u-chart.vue/assets/empty.png') no-repeat center center;
}
</style>
