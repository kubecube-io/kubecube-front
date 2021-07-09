<template>
  <div style="margin-top: -10px">
    <u-linear-layout
      direction="horizontal"
      style="text-align:center"
    >
      <u-text>日志</u-text><u-text size="large">
        {{ total }}
      </u-text><u-text>条</u-text>
      <u-filter-agg />
    </u-linear-layout>
    <x-echarts
      ref="chart"
      style="width: 100%; height: 150px"
      :options="chartOptions"
      autoresize
      @brushselected="brushSelectedHandler"
      @click="selectBar"
    />
  </div>
</template>

<script>
import filters from '@micro-app/common/filters/filter';

function extractData(rawData) {
    const categoryData = rawData.map(i => filters.smartDateFormat(i.key_as_string));
    const values = rawData.map(i => i.doc_count);
    return {
        categoryData, values,
    };
}

function getOptions(categoryData, values) {
    return {
        backgroundColor: '#fff',
        animation: false,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000',
            },
            // extraCssText: 'width: 170px'
        },
        axisPointer: {
            link: { xAxisIndex: 'all' },
            label: {
                backgroundColor: '#777',
            },
        },
        toolbox: {
            show: false,
            // feature: {
            //     brush: {
            //         type: ['lineX', 'clear']
            //     }
            // }
        },
        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            outOfBrush: {
                colorAlpha: 0.1,
            },
            throttleType: 'debounce',
            throttleDelay: 250,
        },
        grid: [
            {
                top: 10,
                left: 50,
                right: 30,
                height: '60%',
            },
        ],
        xAxis: [
            {
                type: 'category',
                data: categoryData,
                scale: true,
                boundaryGap: true,
                axisLine: { onZero: false },
                splitLine: { show: false },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100,
                },
            },
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: true,
                },
                axisPointer: {
                    show: false,
                },
                splitNumber: 3,
            },
        ],
        dataZoom: [
            {
                show: true,
                xAxisIndex: [ 0 ],
                type: 'slider',
                top: '85%',
                bottom: 10,
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                name: '条数',
                type: 'bar',
                data: values,
                smooth: true,
                lineStyle: {
                    opacity: 0.5,
                },
            },
        ],
    };
}

import filterAgg, { intervalToTimestamp } from './filter-agg.vue';
import { mapState } from 'vuex';
import xEcharts from '@cloud-ui/x-echarts.vue';
export default {
    components: {
        'u-filter-agg': filterAgg,
        'x-echarts': xEcharts,
    },
    props: {
        data: Object,
    },
    data() {
        return {
            loading: false,
            chartOptions: null,
            total: 0,
            getDataArea: null,
        };
    },
    computed: mapState({
        clusterId: state => state.scope.cluster.clusterId,
        namespace: state => state.scope.namespace.metadata && state.scope.namespace.metadata.name,
        filterQuery: state => state.lens.query,
        filterFilters: state => state.lens.filters,
        startTime: state => state.timer.startTime,
        endTime: state => state.timer.endTime,
        interval: state => state.timer.interval,
        task: state => state.lens.task,
    }),
    watch: {
        data(val) {
            this.renderChart(val);
        },
    },
    mounted() {
        if (this.data) { this.renderChart(this.data); }
    },
    methods: {
        renderChart(data) {
            this.total = data.hits.total;
            if (!data.aggregations) return;
            const buckets = data.aggregations[2].buckets;
            const {
                categoryData, values,
            } = extractData(buckets);
            this.chartOptions = getOptions(categoryData, values);
            this.$nextTick(() => {
                this.$refs.chart.dispatchAction({
                    type: 'brush',
                    command: 'clear',
                    areas: [],
                });
                this.$refs.chart.dispatchAction({
                    type: 'takeGlobalCursor',
                    key: 'brush',
                    brushOption: {
                        brushType: 'rect',
                        brushMode: 'single',
                    },
                });
            });

            this.getDataArea = (start, end) => {
                if (buckets.length === 1) return null;
                let startTime = +new Date(buckets[start].key_as_string);
                let endTime = +new Date(buckets[end].key_as_string);

                if (startTime === endTime) {

                    const span = intervalToTimestamp(this.interval);
                    startTime = startTime - span / 2;
                    endTime = endTime + span / 2;
                }
                const span = endTime - startTime;
                let interval = '1d';
                if (span < 24 * 60 * 60 * 1000 * 10) {
                    interval = '1h';
                }
                if (span < 60 * 60 * 1000 * 10) {
                    interval = '1m';
                }
                return {
                    interval,
                    start: startTime,
                    end: endTime,
                };
            };
        },
        brushSelectedHandler(param) {
            if (!param.batch[0] || !param.batch[0].selected[0]) return;
            const {
                dataIndex,
            } = param.batch[0].selected[0];
            if (dataIndex.length > 0) {
                this.$emit('selected', this.getDataArea(dataIndex[0], dataIndex[dataIndex.length - 1]));
            } else {
                this.$emit('selected', null);
            }
        },
        selectBar(e) {
            if (typeof e.dataIndex === 'number') {
                const dataIndex = e.dataIndex;
                this.$emit('selected', this.getDataArea(dataIndex, dataIndex));
            }

        },
    },
};
</script>

<style>

</style>
