<template>
  <div>
    <div :class="$style.line_layout" style="margin-bottom: 12px">
      <template v-if="!noPodEvent">
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
          <template v-else-if="workload === 'cronjobs'">
            <el-select
              v-if="currentVersionPods.length"
              v-model="currentJob"
              style="width:200px"
              placeholder="请选择"
              @change="handleJobChange"
            >
              <el-option
                v-for="item in jobList"
                :key="item.value"
                :label="item.text"
                :value="item.value"
                :title="item.text"
              />
            </el-select>
            <el-select
              v-else
              style="width:200px"
              placeholder="暂无 job"
              :disabled="true"
            />
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
      <el-checkbox v-model="autoRefresh">
        自动刷新
      </el-checkbox>
    </div>
    <el-table
      v-loading="loading"
      :data="events"
      style="width: 100%"
    >
      <el-table-column
        prop="message"
        label="消息"
      />
      <el-table-column
        prop="reason"
        label="原因"
        width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="involvedObject.fieldPath"
        label="事件对象fieldPath"
        width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="firstTimestamp"
        label="首次出现时间"
        width="160"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          {{ row.firstTimestamp | formatLocaleTime }}
        </template>
      </el-table-column>
      <el-table-column
        prop="lastTimestamp"
        label="上次出现时间"
        width="160"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          {{ row.lastTimestamp | formatLocaleTime }}
        </template>
      </el-table-column>
      <el-table-column
        prop="count"
        label="计数"
        width="100"
        :show-overflow-tooltip="true"
      />
    </el-table>
  </div>
</template>

<script>

import { get as getFunc, uniq, omit, upperFirst, flatten } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import extendWorkloadService from 'kubecube/services/k8s-extend-resource';
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
            jobList: [],
            currentJob: '',
            loadCount: 1,
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
            if ([ 'ingresses' ].includes(this.$route.params.workload)) {
                return literal.substring(0, literal.length - 2);
            }
            return literal.substring(0, literal.length - 1);
        },
        eventParams() {
            const params = {
                sortFunc: 'time',
                sortName: 'lastTimestamp',
                sortOrder: 'desc',
            };
            if (this.kind === 'pod') {
                if (this.workload === 'deployments') {
                    params.fieldSelector = `involvedObject.kind=Pod,involvedObject.name=${this.pod || ''}`;
                } else {
                    // const target = this.currentVersionPods.find(item => item.value === this.pod);
                    // params.fieldSelector = `involvedObject.uid=${target && target.uid || ''}`;
                    params.fieldSelector = `involvedObject.kind=Pod,involvedObject.name=${this.pod || ''}`;
                }
            } else {
                params.fieldSelector = `involvedObject.name=${this.instance.metadata.name},involvedObject.uid=${this.instance.metadata.uid}`;
                // params.fieldSelector = `involvedObject.kind=${this.workloadLiteral},involvedObject.name=${this.instance.metadata.name}`;
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
                    sortFunc: 'time',
                    sortName: 'lastTimestamp',
                    sortOrder: 'desc',
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
            // selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
            let selector = `metadata.ownerReferences.uid=${this.instance.metadata.uid}`;
            if (this.workload === 'services') {
                selector = this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(',');
            }
            if (this.workload === 'cronjobs') {
                selector = `metadata.ownerReferences.uid=${this.currentJob}`;
            }
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                },
                params: {
                    pageSize: 10000,
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    // selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                    selector,
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
        currentJob() {
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
        this.isDestroyed = true;
        if (this.currtimeout) {
            clearTimeout(this.currtimeout);
        }
    },
    methods: {
        async loadJobList() {
            const response = await extendWorkloadService.getInstance({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.instance.metadata.name,
                },
            });
            const jobs = getFunc(response, 'extendInfo.jobs');
            this.jobList = (jobs || []).map(item => {
                return {
                    text: item.metadata.name,
                    value: item.metadata.uid,
                };
            });
            setValueIfListNotPresent({
                list: this.jobList,
                path: 'value',
                current: this.currentJob,
            }, val => {
                this.currentJob = getFunc(val, 'value');
            });
        },
        async loadPodList() {
            const response = await workloadService.getAPIV1(this.podParams);
            const list = (response.items || []).map(i => ({
                text: i.metadata.name,
                value: i.metadata.name,
                uid: i.metadata.uid,
            }));
            setValueIfListNotPresent({
                list,
                path: 'value',
                current: this.pod,
            }, val => {
                this.pod = getFunc(val, 'value');
            });
            this.currentVersionPods = list;
        },
        async loadEventsList() {
            const resevent = await workloadService.getAPIV1(this.eventParams);
            this.events = (resevent.items || []).map(toEventPlainObject);
        },
        async load() {
            const currentCount = ++this.loadCount;
            this.loading = true;
            if (this.currtimeout) {
                clearTimeout(this.currtimeout);
            }
            if (this.kind === 'default' || this.noPodEvent) {
                await this.loadEventsList();
                // const response = await workloadService.getAPIV1(this.eventParams);
                // this.events = (response.items || []).map(toEventPlainObject);
            } else if (this.workload === 'deployments') {
                // const dpname = this.instance.metadata.name;
                // const [ rptRes, evtRes ] = await Promise.all([
                //     workloadService.getWorkloads(this.replicasParams),
                //     workloadService.getAPIV1(this.podEventParams),
                // ]);
                // const replicasets = rptRes.items.filter(i => {
                //     return getFunc(i, 'metadata.ownerReferences[0].kind') === 'Deployment' &&
                //         getFunc(i, 'metadata.ownerReferences[0].name') === dpname;
                // });
                const replicasRes = await workloadService.getWorkloads({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'replicasets',
                    },
                    params: {
                        pageSize: 10000,
                        selector: `metadata.ownerReferences.uid=${this.instance.metadata.uid}`,
                        sortName: 'metadata.creationTimestamp',
                        sortOrder: 'desc',
                    },
                });
                const replicasets = replicasRes.items || [];
                const rpIds = replicasets.map(i => getFunc(i, 'metadata.uid'));
                const rpOld = rpIds.slice(1);
                const rpCurr = getFunc(rpIds, '[0]');


                // const rpnames = replicasets.map(i => getFunc(i, 'metadata.name'));
                // const rpnamesOld = rpnames.slice(1);
                // const rpnamesCurr = getFunc(rpnames, '[0]');
                let [ currentVersionPods, ...historyVersionPods ] = await Promise.all([
                    (async () => {
                        const res = await workloadService.getAPIV1({
                            pathParams: {
                                cluster: this.cluster,
                                namespace: this.namespace,
                                resource: 'pods',
                            },
                            params: {
                                pageSize: 10000,
                                selector: `metadata.ownerReferences.uid=${rpCurr}`,
                            },
                        });
                        return (res.items || []).map(i => i.metadata.name);
                    })(),
                    ...rpOld.map(async id => {
                        const res = await workloadService.getAPIV1({
                            pathParams: {
                                cluster: this.cluster,
                                namespace: this.namespace,
                                resource: 'pods',
                            },
                            params: {
                                pageSize: 10000,
                                selector: `metadata.ownerReferences.uid=${id}`,
                            },
                        });
                        return (res.items || []).map(i => i.metadata.name);
                    }),
                ]);
                historyVersionPods = flatten(historyVersionPods);

                const makeTV = n => ({ text: n, value: n });
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
                await this.loadEventsList();
                // const evtRes = await workloadService.getAPIV1(this.podEventParams);
                // const events = [];
                // evtRes.items.forEach(i => {
                //     const podName = getFunc(i, 'involvedObject.name');
                //     const arr = podName.split('-');
                //     const podPrefix = arr.slice(0, arr.length - 1).join('-');
                //     if (currentVersionPods.includes(podName)) {
                //         events.push(i);
                //     } else if (historyVersionPods.includes(podPrefix)) {
                //         events.push(i);
                //     }
                // });
                // this.eventGrouped = groupBy(events, i => getFunc(i, 'involvedObject.name'));

            } else if (this.workload === 'cronjobs') {
                await this.loadJobList();
                await this.loadPodList();
                await this.loadEventsList();
            } else {
                await this.loadPodList();
                await this.loadEventsList();
                // const response = await workloadService.getAPIV1(this.podParams);
                // const list = (response.items || []).map(i => ({
                //     text: i.metadata.name,
                //     value: i.metadata.name,
                //     uid: i.metadata.uid,
                // }));
                // setValueIfListNotPresent({
                //     list,
                //     path: 'value',
                //     current: this.pod,
                // }, val => {
                //     this.pod = getFunc(val, 'value');
                // });
                // this.currentVersionPods = list;
                // const resevent = await workloadService.getAPIV1(this.eventParams);
                // this.events = (resevent.items || []).map(toEventPlainObject);

            }
            this.loading = false;
            if (currentCount === this.loadCount && this.autoRefresh && !this.isDestroyed) {
                if (this.currtimeout) {
                    clearTimeout(this.currtimeout);
                }
                this.currtimeout = setTimeout(() => {
                    this.load();
                }, 3000);
            }
        },
    },
};
</script>

<style module>
.line_layout > * {
    margin-right: 12px;
}
</style>
