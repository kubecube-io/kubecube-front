<template>
  <div>
    <u-linear-layout style="margin-bottom: 20px">
      <template v-if="workload !== 'pods'">
        <u-select
          v-model="kind"
          :data="kinds"
        />

        <template v-if="kind === 'pod'">
          <template v-if="workload === 'deployments'">
            <u-select
              v-model="type"
              :data="types"
            />
            <u-select
              v-if="podList.length"
              key="podList"
              v-model="pod"
              :data="podList"
              size="large"
            />
            <u-select
              v-else
              key="nopodList"
              :data="[{ text: '暂无 Pod 事件', value: '' }]"
              size="large"
              disabled
            />
          </template>
          <template v-else>
            <u-select
              v-if="currentVersionPods.length"
              key="podList2"
              v-model="pod"
              :data="currentVersionPods"
              size="large"
            />
            <u-select
              v-else
              key="nopodList2"
              :data="[{ text: '暂无 Pod 事件', value: '' }]"
              size="large"
              disabled
            />
          </template>
        </template>
      </template>
      <u-checkbox v-model="autoRefresh">
        自动刷新
      </u-checkbox>
    </u-linear-layout>
    <kube-table
      table-width="100%"
      :columns="columns"
      :loading="loading"
      :items="(workload === 'deployments' && kind === 'pod') ? (getCondition(conditionsGrouped[pod]) || []) : conditions"
    >
      <template #[`item.lastTransitionTime`]="{ item }">
        {{ item.lastTransitionTime | formatLocaleTime }}
      </template>
      <template #[`item.lastUpdateTime`]="{ item }">
        {{ item.lastUpdateTime | formatLocaleTime }}
      </template>
      <template #noData>
        暂无数据
      </template>
    </kube-table>
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
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
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

                podRes.items.forEach(i => {
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

<style>

</style>
