<template>
  <div :class="$style.root">
    <h1 :class="$style.title">
      {{ meta.title }}
    </h1>
    <kube-table
      table-width="100%"
      :loading="loading"
      :columns="columns"
      :items="items"
      :resizable="true"
      max-height="500px"
    >
      <template #noData>
        暂无数据
      </template>
    </kube-table>
  </div>
</template>

<script>
import { get } from 'lodash';
import monitorService from 'kubecube/services/monitor';
import { getStep, getStepTime } from 'kubecube/utils/functional';
const METRIC_KEY = Symbol('METRIC_KEY');
export default {
    props: {
        type: String,
        query: Array,
        meta: Object,
        scope: Object,
        startTime: Number,
        endTime: Number,
        formatTime: {
            type: Function,
            default: t => t / 1000,
        },
    },
    data() {
        return {
            flag: true,
            currPromise: null,

            loading: false,
            nodata: false,
            columns: [],
            items: [],
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
        this.currPromise = this.load();
    },
    mounted() {
        [ 'st', 'et', 'meta', 'query' ].forEach(k => {
            this.$watch(k, this.raceRefresh);
        });
    },
    methods: {
        raceRefresh() {
            if (!this.flag) return;
            this.flag = false;
            requestAnimationFrame(() => {
                this.flag = true;
                this.currPromise = this.load();
            });
        },
        load() {
            this.loading = true;
            if (!this.query || !this.query.length) {
                const columns = this.meta.styles.map(s => s.column);
                this.columns = columns;
                this.nodata = true;
                return;
            }
            console.log(this.query);
            // debugger
            const promise = Promise.all(this.query.map(({
                query,
                instant,
            }) => {
                let service;
                let params;

                if (instant) {
                    service = monitorService.queryInstant;
                    params = {
                        query,
                        time: this.et,
                    };
                } else {
                    service = monitorService.queryRange;
                    params = {
                        query,
                        start: this.st,
                        end: this.et,
                        step: this.step,
                    };
                }
                return service({
                    params,
                });
            })).then(response => {
                if (this.currPromise !== promise) return;

                const length = response.reduce((a, r) => a + get(r, 'data.result.length', 0), 0);
                if (length === 0) {
                    const columns = this.meta.styles.map(s => s.column(this.scope));
                    this.columns = columns;
                    this.nodata = true;
                    return;
                }
                const columns = this.meta.styles.map(s => s.column(this.scope));
                const items = {};
                response.forEach((r, idx) => {
                    const data = r.data.result;
                    const qmeta = this.query[idx];

                    data.forEach(d => {
                        if (d.metric) {
                            // 表格键值为子集关系
                            const curMetric = Object.values(d.metric);
                            let key = curMetric.sort().join('-');
                            let finded;
                            for (const k in items) {
                                const keyMetric = items[k][METRIC_KEY];
                                if (keyMetric.length > curMetric.length
                                    && curMetric.every(m => keyMetric.includes(m))) {
                                    finded = k;
                                    break;
                                }
                                if (keyMetric.length < curMetric.length
                                 && keyMetric.every(m => curMetric.includes(m))) {
                                    finded = k;
                                    break;
                                }
                            }
                            if (!finded) {
                                items[key] = {
                                    [METRIC_KEY]: curMetric,
                                };
                                Object.keys(d.metric).forEach(k => {
                                    // 避免遗漏 column
                                    if (!columns.find(c => c.name === k)) {
                                        columns.unshift({
                                            title: k, name: k,
                                        });
                                    }

                                    Object.assign(items[key], {
                                        [k]: d.metric[k],
                                    });
                                });
                            } else if (finded && key !== finded) {
                                const newKey = key.length > finded.length ? key : finded;
                                items[newKey] = items[finded];
                                key = newKey;
                            }
                            Object.assign(items[key], {
                                [qmeta.ref]: get(d, 'value[1]', '-'),
                            });
                        }
                    });

                });
                this.columns = columns;
                this.items = Object.values(items);


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
    width: 100%;
}
.title{
    text-align: center;
    font-size: 1.2em;
}
</style>
