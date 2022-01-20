<template>
  <div>
    <!-- <u-info-list-group :title="`${title} 监控`" /> -->
    <u-linear-layout
      direction="vertical"
      style="margin-bottom: 20px;"
    >
      <u-loading v-if="loading" />
      <div v-else-if="rows.length === 0">
        暂无监控项
      </div>
      <template v-else>
        <u-linear-layout>
          <!-- <u-text>时间</u-text> -->
          <u-date-custom-picker
            ref="dataPicker"
            style="margin-left: 10px"
            :date="{startTime, endTime}"
            :time-range="periodList"
            :no-interval="true"
            @update="updateTime"
          />
        </u-linear-layout>
        <kube-pipe
          v-if="variables.length > 0"
          ref="pipeVariables"
          :graph="pipeSeq"
          :class="$style.variableWrapper"
          @pipestatechange="pipeLoading = $event"
        >
          <div
            v-for="v in variables"
            :key="v.name"
            :class="$style.variable"
          >
            <u-text>{{ v.displayName }}</u-text>
            <kube-valve
              component="span"
              :name="v.name"
              :valve="variableSelected[v.name]"
              :request="() => resolveRequest(v)"
            >
              <template v-if="sources[v.name]">
                <template v-if="sources[v.name].length > 0">
                  <div>
                    <span :class="$style.occupation">{{ findLongest(sources[v.name]) }}</span>
                    <u-select
                      v-model="variableSelected[v.name]"
                      size="large"
                      style="width: 100%"
                      :class="$style.selector"
                      :data="sources[v.name]"
                    />
                  </div>
                </template>
                <u-select
                  v-else
                  size="large"
                  disabled
                  style="width: auto"
                  :data="[{ text: `暂无${v.name}`}]"
                />
              </template>
            </kube-valve>
          </div>
        </kube-pipe>
      </template>
    </u-linear-layout>
    <template v-if="!pipeLoading">
      <u-info-list-group

        v-for="row in rows"
        :key="row.name"
        :title="row.name"
        column="1"
        label-size="large"
      >
        <div :class="$style.container">
          <div
            v-for="panel in row.panels"
            :key="panel.name"
            :is-table="panel.type === 'table'"
            :class="[$style.block, $style[`block-${panel.span}`]]"
          >
            <kube-chart
              v-if="panel.type === 'graph'"
              :title="panel.title"
              :meta="panel"
              :scope="scope"
              :query="panel.targets.map(t => t.query({...variableSelected, ...scope}))"
              :legend-template="panel.targets.map(t => t.legendTemplate)"
              :start-time="startTime"
              :end-time="endTime"
              :period-list="periodList"
              height="270px"
            />
            <kube-data-table
              v-if="panel.type === 'table'"
              :query="panel.targets.map(t => ({
                ...t,
                query: t.query({...variableSelected, ...scope})
              }))"
              :scope="scope"
              :meta="panel"
              :start-time="startTime"
              :end-time="endTime"
            />
            <kube-data-board
              v-if="panel.type === 'singleStat'"
              :query="panel.targets.map(t => ({
                ...t,
                query: t.query({...variableSelected, ...scope})
              }))"
              :meta="panel"
              :scope="scope"
              :start-time="startTime"
              :end-time="endTime"
            />
          </div>
        </div>
      </u-info-list-group>
    </template>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import monitorService from 'kubecube/services/monitor';
import {
    toPlainObject as toMonitorPlainObject,
} from 'kubecube/k8s-resources/monitor/index.js';
import {
    setValueIfListNotPresent,
    getStep,
    getStepTime,
} from 'kubecube/utils/functional';
import kubeDataBoard from 'kubecube/component/common/kube-data-board/kube-data-board.vue';

export default {
    metaInfo: {
        title: '监控 - kubecube',
    },
    components: {
        kubeDataBoard,
    },
    props: {
        instance: Object,
    },
    data() {
        const now = Date.now();
        return {
            // podService: workloadService.getAPIV1,
            queryService: monitorService.queryRange,
            periodList: [
                { name: '近30分钟', value: 30 * 60 * 1000 },
                { name: '近6小时', value: 360 * 60 * 1000 },
                { name: '近1天', value: 1440 * 60 * 1000 },
                // { name: '近7天', value: 10080 * 60 * 1000 },
            ],
            startTime: (now - 30 * 60 * 1000),
            endTime: now,
            title: '',

            loading: false,
            variables: [],
            pipeSeq: null,
            variableSelected: {},
            sources: {},

            rows: [],

            pipeLoading: true,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },

        scope() {
            if (this.instance && this.$route.path.startsWith('/platform')) {
                return {
                    cluster: this.instance.clusterName,
                    node: this.$route.params.nodename,
                };
            }
            const scope = {
                cluster: this.cluster,
                namespace: this.namespace,
            };
            if (this.instance && this.$route.path.startsWith('/control')) {
                Object.assign(scope, {
                    workload: this.instance.metadata.name,
                    pod: this.instance.metadata.name,
                    volume: this.instance.metadata.name,
                    type: this.workload.substr(0, this.workload.length - 1),
                });
            }
            return scope;
        },
        resource() {
            if (this.workload === 'pods') {
                return 'cube-pod-resource';
            }
            if (this.workload === 'persistentvolumeclaims') {
                return 'cube-resource-persistent-volumes';
            }
            if (this.workload) {
                return 'cube-workload-resource';
            }
            return this.$route.meta.resource;

        },
        st() {
            return this.startTime / 1000;
        },
        et() {
            return this.endTime / 1000;
        },
        step() {
            return getStep(this.startTime, this.endTime);
        },
        stepTime() {
            return getStepTime(this.startTime, this.endTime);
        },
    },
    created() {
        this.load();
    },
    mounted() {
        this.$watch(() => [ this.startTime, this.endTime ], () => {
            if (this.$refs.pipeVariables) {
                this.$refs.pipeVariables.pipeRequest();
            }
        });
    },
    methods: {
        async load() {
            this.loading = true;
            const response = await monitorService.getInnerDashboards({
                pathParams: {
                    resource: this.resource,
                },
            });

            const resolved = toMonitorPlainObject(response);
            this.title = resolved.spec.title;
            this.variables = resolved.spec.variables || [];
            this.rows = resolved.spec.rows || [];
            this.pipeSeq = this.variables.map(v => v.name).join(' > ');
            if (this.variables.length === 0) {
                this.pipeLoading = false;
            }
            this.loading = false;
        },
        async resolveRequest(valve) {
            const name = valve.name;
            const vs = await valve.request({ ...this.scope, ...this.variableSelected }, {
                start: this.st,
                end: this.et,
                step: this.step,
            });
            console.log(vs);
            this.$set(this.sources, name, vs);
            setValueIfListNotPresent({
                list: vs,
                path: 'value',
                current: getFunc(this.variableSelected, name),
            }, val => {
                this.$set(this.variableSelected, name, getFunc(val, 'value'));
            });
        },
        resolver(response) {
            console.log(response);
        },
        updateTime({ startTime, endTime }) {
            this.startTime = startTime;
            this.endTime = endTime;
        },
        findLongest(sources) {
            let l = 0;
            let longest = '';
            sources.forEach(s => {
                const p = s.text.length;
                if (p > l) {
                    l = p;
                    longest = s.text;
                }
            });
            return `xxxx${longest}xxxx`;
        },
    },
};
</script>

<style module>
.variableWrapper {
    display: flex;
    flex-wrap: wrap;
}
.variable {
    margin: 10px;
}
.variable > span .occupation {
    display: block;
    visibility: hidden;
    height: 38px;
}
.variable > span .selector {
    position: absolute;
    top: 0;
}
.variable > span{
    position: relative;
    display: inline-block;
    margin-right: 10px;
    vertical-align: middle;
}

.container::after{
    content: ' ';
    display: table;
    clear: both;
}
.container > .block {
    float: left;
    width: 33.333333333%;
    padding: 5px;
}
/* .container > .block[is-table] {
    width: 100%
} */
.container > .block > .chart{
    /* height: 100%; */
    border: 1px solid #dfe4ec;
    padding: 10px;
    margin: 0;
}
.container {
    display: block;
    position: relative;
}
.container::after {
    content: ' ';
    display: table;
    clear: both;
}
.container > .block-12,
.container > .block-11,
.container > .block-10,
.container > .block-9,
.container > .block-8,
.container > .block-7,
.container > .block-6,
.container > .block-5,
.container > .block-4,
.container > .block-3,
.container > .block-2,
.container > .block-1 {
    float: left;
}

.container > .block-1 {
    width: 8.3333333333333%;
}
.container > .block-2 {
    width: 16.666666666666%;
}
.container > .block-3 {
    width: 25%;
}
.container > .block-4 {
    width: 33.3333333333333%;
}
.container > .block-5 {
    width: 41.666666666666%;
}
.container > .block-6 {
    width: 50%;
}
.container > .block-7 {
    width: 58.3333333333333%;
}
.container > .block-8 {
    width: 66.666666666666%;
}
.container > .block-9 {
    width: 75%;
}
.container > .block-10 {
    width: 83.3333333333333%;
}
.container > .block-11 {
    width: 91.666666666666%;
}
.container > .block-12 {
    width: 100%;
}

.container > .chart {
    height: ;
}
</style>
