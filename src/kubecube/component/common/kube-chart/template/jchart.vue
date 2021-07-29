<template>
  <div
    :class="$style.root"
    :style="`height:${height}`"
  >
    <div
      ref="chart"
      :class="$style.chartcontainer"
    >
      <float-content
        v-if="floatMeta.display"
        v-bind="floatMeta"
      />
    </div>
    <legend-content
      :legends="legendMeta.legends"
    />
    <div
      v-if="nodata"
      :class="$style.empty"
    />
    <div
      v-if="loading"
      :class="$style.loading"
    >
      <u-loading />
    </div>
  </div>
</template>

<script>
// import {
//     Data2D,
//     Coord2D,
//     LineChart,
//     CrossIndicator,
//     LegendPlugin,
// } from 'jchart/plugins';

import jChart, {
    Data2D,
    Coord2D,
    LineChart,
    LineIndicator,
    Legend,
} from 'jchart';
import { get, flatten } from 'lodash';
import monitorService from 'kubecube/services/monitor';
import { getStep, getStepTime } from 'kubecube/utils/functional';
import floatContent from './float-content.vue';
import legendContent from './legend-content.vue';
import { niceBytes, BPSunits } from 'kubecube/utils/functional';
const NumberFormatter = new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    compactDisplay: 'short',
});
const dataFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
});
export default {
    components: {
        floatContent,
        legendContent,
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
        scope: Object,
        meta: Object,
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

            floatMeta: {
                display: false,
                x: 0,
                y: 0,
                xDimension: '',
                series: [],
            },

            legendMeta: {
                legends: [],
            },
            loading: false,
            bootchart: null,
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
        // this.initChart();
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

        loadChart() {
            this.loading = true;
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
                // if (useLoading) this.$refs.chart.hideLoading();

                const length = response.reduce((a, r) => a + get(r, 'data.result.length', 0), 0);
                if (length === 0) {
                    this.nodata = true;
                    if (this.chartContext) {
                        this.chartContext.destroy();
                        this.chartContext = null;
                    }

                    return;
                }
                const stackmode = this.meta.stack && 'stack';

                let largest;
                let l = 0;
                response.forEach(r => {
                    const results = get(r, 'data.result', []);
                    results.forEach(r => {
                        const length = r.values.length;
                        if (length > l) {
                            l = length;
                            largest = r.values.map(v => v[0]);
                        }
                    });
                });

                const series = flatten(
                    response.map((r, idx) => get(r, 'data.result', []).map(r => {
                        const values = r.values.map(v => [ v[0] * 1000, +v[1] ]);
                        let vs = [];
                        if (values.length < l) {
                            largest.forEach(t => {
                                const time = t * 1000;
                                const q = values.find(v => v[0] === time);
                                if (q) {
                                    vs.push(q);
                                } else {
                                    vs.push([ t * 1000, 0 ]);
                                }
                            });
                        } else {
                            vs = values;
                        }
                        return {
                            name: this.legendTemplate[idx](r.metric),
                            values: vs,
                        };
                    })));


                // get(r, 'data.result', [])
                //     .map(r => ({
                //         values: r.values.map(v => [ v[0] * 1000, +v[1] ]),
                //         name: this.legendTemplate[idx](r.metric),
                //         // stack: stackmode,
                //     }))));


                const dataoption = {
                    reference: {
                        type: 'continuous',
                    },
                    series,
                    stack: stackmode,
                    xAxis: {
                        span: this.meta.span,
                        format(value) {
                            const datetime = new Date(value);
                            return dataFormatter.format(datetime);
                        },
                    },
                    yAxis: {
                        min: 0,
                        format(value) {
                            return NumberFormatter.format(value);
                        },
                    },
                };
                if (this.meta.axes && this.meta.axes.left) {
                    const {
                        min, max, unit,
                    } = this.meta.axes.left;
                    if (unit === 'bytes') {
                        dataoption.yAxis.format = function(value) {
                            return niceBytes(value);
                        };
                    }
                    if (unit === 'percentunit') {
                        dataoption.yAxis.format = function(value) {
                            return `${NumberFormatter.format(value * 100)}%`;
                        };
                    }
                    if (unit === 'pps' || unit === 'ops') {
                        dataoption.yAxis.format = function(value) {
                            return `${NumberFormatter.format(value)} pps`;
                        };
                    }
                    if (unit === 'Bps') {
                        dataoption.yAxis.format = function(value) {
                            return niceBytes(value, BPSunits);
                        };
                    }
                    dataoption.yAxis.min = min || 0;
                    dataoption.yAxis.max = max;
                }

                if (!this.chartContext) {
                    // this.legendMeta.legends = series.map(s => ({
                    //     legend: {
                    //         name: s.name,
                    //     },
                    //     color: { enable: 'rgba(0,0,0,0)', disable: 'rgba(0,0,0,0)' } }));
                    this.$nextTick(() => {
                        this.chartContext = jChart([
                            new Data2D(),
                            new Coord2D({
                                type: 'vertical',
                                grid: {
                                    vertical: true,
                                    horizontal: true,
                                },
                            }),
                            new LineChart({
                                smooth: true,
                                fill: true,
                            }),
                            new LineIndicator({
                                callback: meta => {
                                    if (!meta.display) {
                                        this.floatMeta.display = meta.display;
                                    } else {
                                        Object.assign(this.floatMeta, meta);
                                    }
                                },
                            }),
                            new Legend({
                                initCallback: legends => {
                                    this.legendMeta.legends = legends;
                                },
                            }),
                        ], {
                            layout: {
                                left: 5,
                                top: 10,
                                bottom: 35,
                                right: 20,
                            },
                        })(this.$refs.chart, dataoption);
                    });
                } else {
                    this.chartContext.resetData(dataoption);
                }
                this.nodata = false;
            });
            promise.then(() => {
                this.loading = false;
            });
            return promise;
        },
    },
};
</script>

<style module>
.root{
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}
.chartcontainer{
    flex: 1;
    width: 100%;
    position: relative;
}
.loading{
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    background: rgba(255,255,255,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
}
.empty{
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    background: url('cloud-ui.vusion/src/u-chart.vue/assets/empty.png') no-repeat center center #fff;
    z-index: 9;
}
</style>
