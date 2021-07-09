<template>
  <div>
    <u-linear-layout style="margin-bottom: 20px">
      <template v-if="!noPodEvent">
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
      :items="(workload === 'deployments' && kind === 'pod') ? (eventGrouped[pod] || []) : events"
    >
      <template #[`item.firstTimestamp`]="{ item }">
        {{ item.firstTimestamp | formatLocaleTime }}
      </template>
      <template #[`item.lastTimestamp`]="{ item }">
        {{ item.lastTimestamp | formatLocaleTime }}
      </template>
      <template #noData>
        暂无数据
      </template>
    </kube-table>
  </div>
</template>

<script>

import { get as getFunc, groupBy, uniq, omit, upperFirst } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toEventPlainObject,
} from 'kubecube/k8s-resources/event/index.js';
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
        if (!to.path.endsWith('/condition') && to.query.kind) {
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
            columns: [
                { title: '消息', name: 'message', textwrap: true },
                { title: '原因', name: 'reason', width: '120px' },
                { title: '事件对象fieldPath', name: 'involvedObject.fieldPath', width: '160px' },
                { title: '首次出现时间', name: 'firstTimestamp', width: '160px' },
                { title: '上次出现时间', name: 'lastTimestamp', width: '160px' },
                { title: '计数', name: 'count', width: '50px' },
            ],
            kind: this.$route.query.kind,

            autoRefresh: true,
            loading: false,

            pod: this.$route.query.pod || null,
            type: this.$route.query.type || 'current',
            types: [{ text: '当前版本', value: 'current' }, { text: '历史版本', value: 'history' }],
            events: [],
            eventGrouped: {},
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
        workloadLiteral() {
            const literal = upperFirst(this.$route.params.workload);
            return literal.substring(0, literal.length - 1);
        },
        eventParams() {
            const params = {};
            if (this.kind === 'pod' && this.pod) {
                params.fieldSelector = `involvedObject.kind=Pod,involvedObject.name=${this.pod}`;
            } else {
                params.fieldSelector = `involvedObject.kind=${this.workloadLiteral},involvedObject.name=${this.instance.metadata.name}`;
            }
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'events',
                },
                params,
            };
        },
        podEventParams() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'events',
                },
                params: {
                    fieldSelector: 'involvedObject.kind=Pod',
                },
            };
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
        workload() {
            return this.$route.params.workload;
        },
        kinds() {
            return [
                { text: this.$route.params.workload, value: 'default' },
                { text: '副本', value: 'pod' },
            ];
        },
        noPodEvent() {
            return [ 'pods', 'ingresses' ].includes(this.workload);
        },
    },
    watch: {
        type(val) {
            const l = val === 'current' ? this.currentVersionPods : this.historyVersionPods;
            this.pod = (getFunc(l, '[0].value') || '');
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
            if (this.kind === 'default' || this.noPodEvent) {
                const response = await workloadService.getAPIV1(this.eventParams);
                this.events = (response.items || []).map(toEventPlainObject);
            } else if (this.workload === 'deployments') {
                const dpname = this.instance.metadata.name;
                const [ rptRes, evtRes ] = await Promise.all([
                    workloadService.getWorkloads(this.replicasParams),
                    workloadService.getAPIV1(this.podEventParams),
                ]);
                const replicasets = rptRes.items.filter(i => {
                    return getFunc(i, 'metadata.ownerReferences[0].kind') === 'Deployment' &&
                        getFunc(i, 'metadata.ownerReferences[0].name') === dpname;
                });

                const rpnames = replicasets.map(i => getFunc(i, 'metadata.name'));
                const rpnamesOld = rpnames.slice(1);
                const rpnamesCurr = getFunc(rpnames, '[0]');
                let currentVersionPods = [];
                let historyVersionPods = [];
                const events = [];
                evtRes.items.forEach(i => {
                    const podName = getFunc(i, 'involvedObject.name');
                    const arr = podName.split('-');
                    const podPrefix = arr.slice(0, arr.length - 1).join('-');
                    if (podName.includes(rpnamesCurr)) {
                        events.push(i);
                        currentVersionPods.push(podName);
                    } else if (rpnamesOld.includes(podPrefix)) {
                        events.push(i);
                        historyVersionPods.push(podName);
                    }
                });

                this.eventGrouped = groupBy(events, i => getFunc(i, 'involvedObject.name'));

                const makeTV = n => ({ text: n, value: n });
                console.log(currentVersionPods, historyVersionPods);
                currentVersionPods = uniq(currentVersionPods).map(makeTV);
                historyVersionPods = uniq(historyVersionPods).map(makeTV);
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
            } else {
                const response = await workloadService.getAPIV1(this.podParams);
                const list = (response.items || []).map(i => ({
                    text: i.metadata.name,
                    value: i.metadata.name,
                }));
                setValueIfListNotPresent({
                    list,
                    path: 'value',
                    current: this.pod,
                }, val => {
                    this.pod = getFunc(val, 'value');
                });
                this.currentVersionPods = list;
                const resevent = await workloadService.getAPIV1(this.eventParams);
                this.events = (resevent.items || []).map(toEventPlainObject);

            }
            this.loading = false;

        },
    },
};
</script>

<style>

</style>
