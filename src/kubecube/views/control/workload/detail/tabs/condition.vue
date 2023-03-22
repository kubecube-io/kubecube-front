<template>
  <div>
    <div :class="$style.line_layout" style="margin-bottom: 12px">
      <template v-if="workload !== 'pods'">
        <el-select
          v-model="kind"
          style="width:200px"
          placeholder="请选择"
        >
          <el-option
            v-for="item in kinds"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
        <template v-if="kind === 'pod'">
          <template v-if="workload === 'deployments'">
            <el-select
              v-model="type"
              style="width:200px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in types"
                :key="item.value"
                :label="item.text"
                :value="item.value"
                :title="item.text"
              />
            </el-select>
            <el-select
              v-if="podList.length"
              v-model="pod"
              style="width:400px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in podList"
                :key="item.value"
                :label="item.text"
                :value="item.value"
                :title="item.text"
              />
            </el-select>
            <el-select
              v-else
              style="width:400px"
              placeholder="暂无 Pod"
              :disabled="true"
            />
          </template>
          <template v-else>
            <el-select
              v-if="currentVersionPods.length"
              v-model="pod"
              style="width:400px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in currentVersionPods"
                :key="item.value"
                :label="item.text"
                :value="item.value"
                :title="item.text"
              />
            </el-select>
            <el-select
              v-else
              style="width:400px"
              placeholder="暂无 Pod"
              :disabled="true"
            />
          </template>
        </template>
      </template>
      <u-checkbox v-model="autoRefresh">
        自动刷新
      </u-checkbox>
    </div>
    <el-table
      v-loading="loading"
      :data="(workload === 'deployments' && kind === 'pod') ? (getCondition(conditionsGrouped[pod]) || []) : conditions"
      style="width: 100%"
    >
      <el-table-column
        prop="type"
        label="类型"
        width="160"
      />
      <el-table-column
        prop="reason"
        label="条件"
        width="200"
      />
      <el-table-column
        prop="message"
        label="消息"
      />
      <el-table-column
        prop="lastUpdateTime"
        label="上次检测时间"
        width="160"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          {{ row.lastUpdateTime | formatLocaleTime }}
        </template>
      </el-table-column>
      <el-table-column
        prop="lastTimestamp"
        label="上次转换时间"
        width="160"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          {{ row.lastTransitionTime | formatLocaleTime }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

import { get as getFunc, groupBy, omit } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    beforeRouteEnter(to, from, next) {
        if (to.query.kind) {
            next();
        } else {
            const isPod = to.params.workload === 'pods';
            const kind = isPod ? 'pod' : 'default';
            const query = {
                kind,
                ...to.query,
            };
            if (isPod) {
                query.pod = to.params.instance;
            }
            next({
                path: to.path,
                query,
            });
        }
    },
    beforeRouteLeave(to, from, next) {
        if (!to.path.endsWith('/event') && to.query.kind) {
            next({
                path: to.path,
                query: omit(to.query, [ 'kind', 'pod', 'type' ]),
            });
        } else {
            next();
        }
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            replicaService: workloadService.getWorkloads,
            columns: [
                { title: '类型', name: 'type', width: '160px', textwrap: true },
                { title: '条件', name: 'reason', width: '200px', textwrap: true },
                { title: '消息', name: 'message', textwrap: true },
                { title: '上次检测时间', name: 'lastUpdateTime', width: '160px' },
                { title: '上次转换时间', name: 'lastTransitionTime', width: '160px' },
            ],
            kind: this.$route.query.kind,

            autoRefresh: true,
            loading: false,

            pod: this.$route.query.pod || null,
            type: this.$route.query.type || 'current',
            types: [{ text: '当前版本', value: 'current' }, { text: '历史版本', value: 'history' }],
            conditions: [],
            conditionsGrouped: {},
            currentVersionPods: [],
            historyVersionPods: [],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        podList() {
            return this.type === 'current' ? this.currentVersionPods : this.historyVersionPods;
        },
        replicasParams() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'replicasets',
                },
                params: {
                    sortFunc: 'time',
                    sortName: 'metadata.creationTimestamp',
                    sortOrder: 'desc',
                    labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                },
            };
        },
        podParams() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                },
                params: {
                    labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    // selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                },
            };
        },
        workloadParams() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.$route.params.instance,
                },
            };
        },
        workload() {
            return this.$route.params.workload;
        },
        kinds() {
            return [
                { text: this.$route.params.workload, value: 'default' },
                { text: '副本', value: 'pod' },
            ];
        },
    },
    watch: {
        // kind() {
        //     this.load();
        // },
        // pod() {
        //     this.load();
        // },
        type(val) {
            const l = val === 'current' ? this.currentVersionPods : this.historyVersionPods;
            this.pod = (getFunc(l, '[0].value') || undefined);
        },
        autoRefresh(val) {
            if (!val) {
                clearTimeout(this.currtimeout);
            } else {
                this.load();
            }
        },
        '$route.query': function() {
            this.load();
        },
    },
    created() {
        this.load();
    },
    mounted() {
        this.$watch(() => [ this.kind, this.pod ], () => {
            this.$router.push({
                path: this.$route.path,
                query: {
                    ...this.$route.query,
                    kind: this.kind,
                    type: this.type,
                    pod: this.pod,
                },
            });
        });
    },
    destroyed() {
        if (this.currtimeout) {
            clearTimeout(this.currtimeout);
        }
    },
    methods: {
        getCondition(pod) {
            return getFunc(pod, '[0]status.conditions', []);
        },
        async load() {
            this.loading = true;
            if (this.autoRefresh) {
                if (this.currtimeout) {
                    clearTimeout(this.currtimeout);
                }
                this.currtimeout = setTimeout(() => {
                    this.load();
                }, 3000);
            }
            if (this.kind === 'default') {
                const response = await (this.workload === 'jobs' ? workloadService.getBatchInstance : workloadService.getInstance)(this.workloadParams);
                this.conditions = (getFunc(response, 'status.conditions') || []);
            } else if (this.workload === 'deployments') {
                const dpname = this.instance.metadata.name;
                const [ rptRes, podRes ] = await Promise.all([
                    workloadService.getWorkloads(this.replicasParams),
                    workloadService.getAPIV1(this.podParams),
                ]);
                const replicasets = rptRes.items.filter(i => {
                    return getFunc(i, 'metadata.ownerReferences[0].kind') === 'Deployment' &&
                        getFunc(i, 'metadata.ownerReferences[0].name') === dpname;
                });

                const rpnames = replicasets.map(i => getFunc(i, 'metadata.name'));
                const rpnamesOld = rpnames.slice(1);
                const rpnamesCurr = getFunc(rpnames, '[0]');
                const currentVersionPods = [];
                const historyVersionPods = [];

                (podRes.items || []).forEach(i => {
                    const replicaname = getFunc(i, 'metadata.ownerReferences[0].name');
                    const name = getFunc(i, 'metadata.name');
                    if (replicaname === rpnamesCurr) {
                        currentVersionPods.push({
                            text: name, value: name,
                        });
                    } else if (rpnamesOld.includes(replicaname)) {
                        historyVersionPods.push({
                            text: name, value: name,
                        });
                    }
                });
                this.conditionsGrouped = groupBy(podRes.items, i => getFunc(i, 'metadata.name'));

                if (this.pod) {
                    const p = currentVersionPods.find(p => p.value === this.pod);
                    const t = historyVersionPods.find(p => p.value === this.pod);
                    if (!p && !t) {
                        this.type = 'current';
                        this.pod = getFunc(currentVersionPods, '[0].value');
                    }
                } else {
                    const l = (this.type === 'current' ? currentVersionPods : historyVersionPods).length;
                    if (l > 0) {
                        this.pod = getFunc(currentVersionPods, '[0].value');
                    }
                }
                this.currentVersionPods = currentVersionPods;
                this.historyVersionPods = historyVersionPods;
            } else if (this.workload === 'pods') {
                const response = await workloadService.getAPIV1Instance(this.workloadParams);
                this.conditions = (getFunc(response, 'status.conditions') || []);
            } else {
                const response = await workloadService.getAPIV1(this.podParams);
                const list = (response.items || []).map(i => ({
                    text: i.metadata.name,
                    value: i.metadata.name,
                    ...i,
                }));
                setValueIfListNotPresent({
                    list,
                    path: 'value',
                    current: this.pod,
                }, val => {
                    this.pod = val.value;
                });
                this.currentVersionPods = list;
                const p = list.find(p => this.pod === p.value);
                this.conditions = (getFunc(p, 'status.conditions', []) || []);

            }
            this.loading = false;
        },
    },
};
</script>

<style module>
.line_layout > * {
    margin-right: 12px;
}
</style>
