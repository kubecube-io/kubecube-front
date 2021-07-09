<template>
  <div :class="$style.root">
    <div :class="$style.title">
      {{ meta.title }}
    </div>
    <div :class="$style.container">
      <div
        v-for="(target, idx) in meta.targets"
        :key="target.legend"
        :class="$style.numberblock"
      >
        <div
          v-if="target.legend"
          :class="$style.title"
        >
          {{ target.legend }}
        </div>
        <div
          :class="$style.value"
        >
          <template v-if="data[idx]">
            <u-link
              v-if="meta.linkUrl"
              :to="{path: meta.linkUrl(data[idx], scope)}"
            >
              {{ data[idx].value || 0 }}
            </u-link>
            <span v-else>
              {{ data[idx].value || 0 }}
              <sub v-if="data[idx].unit">{{ data[idx].unit }}</sub>
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import monitorService from 'kubecube/services/monitor';
import { getStep, getStepTime } from 'kubecube/utils/functional';

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
            data: [],

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
                this.nodata = true;
                return;
            }

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
                const data = response.map(r => {
                    const value = this.meta.formatter(getFunc(r, 'data.result[0].value[1]') || 0);
                    const v = /([\d.]+)/.exec(value);
                    const u = /([^\d.]+)/.exec(value);
                    if (v) {
                        return {
                            value: v[1],
                            unit: u ? u[1] : '',
                        };
                    }
                    return {
                        value,
                    };
                });

                this.data = data;
                // console.log(response);
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

.root > .title {
    text-align: center;
    background: #F7F8FA;
    color: #000;
    font-weight: 300;
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    padding: 11px 0;
}
 .container{
    display: flex;
    flex-direction: row;
    background: #fff;
}
.numberblock{
    display: flex;
    flex-direction: column;
    padding: 5px 18px;
    flex: 1;
    height: 60px;
    align-items: center;
    justify-content: center;
}

.numberblock .title {
    color: #999999;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    font-weight: normal;
    font-size: .8em;
}
.numberblock .value {
    text-align: center;
    font-size: 1.5em;
    font-weight: 500;
    color: #303B61;
}

.numberblock sub {
    bottom: 0;
    font-size: .6em;
    font-weight: lighter;
}

</style>
