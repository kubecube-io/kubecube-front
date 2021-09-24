<template>
  <div :class="$style.container">
    <div :class="$style.root">
      <div :class="$style.block">
        <u-app-cluster-select :is-side-bar="false" />
      </div>
      <u-loading v-if="pipeloading" />
      <div
        v-else-if="items.length === 0"
        :class="$style.empty"
      >
        <div :class="$style.icon">
          <img :src="bgImage">
          <div>暂无数据</div>
          <p>请在【运维管理】> 【资源管理】> 【空间管理】中创建空间</p>
        </div>
      </div>
      <div
        v-else
        :class="$style.grid"
      >
        <div
          v-for="p in items"
          :key="p.value"
          :class="$style.panel"
          @click="toNamespace(p)"
        >
          <div :class="$style.header">
            空间：{{ p.metadata.name }}
          </div>
          <x-request
            :class="$style.body"
            :service="monitorService(p)"
            :params="{}"
            :processor="resolver"
          >
            <template slot-scope="{ data, loading }">
              <u-loading v-if="loading" />
              <template v-else>
                <div :class="$style.title">
                  CPU (Cores)
                </div>
                <div :class="$style.content">
                  <div>
                    <div :class="$style.subtitle">
                      Requests / 配额 / 利用率
                    </div>
                    <div :class="$style.value">
                      {{ data.cpuReqUsed }}<sub>Cores</sub>/{{ data.cpuReqHard }}<sub>Cores</sub> ({{ data.cpuRequestUsedRate | percentageFilter }})
                    </div>
                  </div>
                  <div>
                    <div :class="$style.subtitle">
                      Limits / 配额 / 利用率
                    </div>
                    <div :class="$style.value">
                      {{ data.cpuLimitUsed }}<sub>Cores</sub>/{{ data.cpuLimitHard }}<sub>Cores</sub> ({{ data.cpuRequestHardRate | percentageFilter }})
                    </div>
                  </div>
                </div>

                <div :class="$style.title">
                  内存
                </div>
                <div :class="$style.content">
                  <div>
                    <div :class="$style.subtitle">
                      Requests / 配额 / 利用率
                    </div>
                    <div :class="$style.value">
                      {{ data.memReqUsed | niceBytes }}<sub>{{ data.memReqUsed | niceBytesUnit }}</sub>/{{ data.memReqHard | niceBytes }}<sub>{{ data.memReqHard | niceBytesUnit }}</sub> ({{ data.memRequestUsedRate | percentageFilter }})
                    </div>
                  </div>
                  <div>
                    <div :class="$style.subtitle">
                      Limits / 配额 / 利用率
                    </div>
                    <div :class="$style.value">
                      {{ data.memLimitUsed | niceBytes }}<sub>{{ data.memLimitUsed | niceBytesUnit }}</sub>/{{ data.memLimitHard | niceBytes }}<sub>{{ data.memLimitHard | niceBytesUnit }}</sub> ({{ data.memRequestHardRate | percentageFilter }})
                    </div>
                  </div>
                </div>
                <div :class="$style.title">
                  资源
                </div>
                <div :class="$style.workloads">
                  <div>
                    Deployments:
                    <u-link @click.stop="toWorkloads(p, 'deployments')">
                      {{ data.deployments }}
                    </u-link>
                  </div>
                  <div>
                    Cronjobs:
                    <u-link @click.stop="toWorkloads(p, 'cronjobs')">
                      {{ data.cronjobs }}
                    </u-link>
                  </div>
                  <div>
                    Services:
                    <u-link @click.stop="toWorkloads(p, 'services')">
                      {{ data.services }}
                    </u-link>
                  </div>
                  <div>
                    Statefulsets:
                    <u-link @click.stop="toWorkloads(p, 'statefullsets')">
                      {{ data.statefullsets }}
                    </u-link>
                  </div>
                  <div>
                    Jobs:
                    <u-link @click.stop="toWorkloads(p, 'jobs')">
                      {{ data.jobs }}
                    </u-link>
                  </div>
                  <div>
                    Ingresses:
                    <u-link @click.stop="toWorkloads(p, 'ingresses')">
                      {{ data.ingresses }}
                    </u-link>
                  </div>
                  <div>
                    Daemonsets:
                    <u-link @click.stop="toWorkloads(p, 'daemonsets')">
                      {{ data.daemonsets }}
                    </u-link>
                  </div>
                  <div>
                    Pods:
                    <u-link @click.stop="toWorkloads(p, 'pods')">
                      {{ data.pods }}
                    </u-link>
                  </div>
                  <div>
                    PVCs:
                    <u-link @click.stop="toWorkloads(p, 'persistentvolumeclaims')">
                      {{ data.persistentvolumeclaims }}
                    </u-link>
                  </div>
                </div>
              </template>
            </template>
          </x-request>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get, sync } from 'vuex-pathify';
import nsService from 'kubecube/services/namespace';
import monitorService from 'kubecube/services/monitor';
import {
    resolveTemplate,
} from 'kubecube/k8s-resources/monitor/utils.js';
import { niceBytes } from 'kubecube/utils/functional';

import valveMixin from 'kubecube/mixins/pipe/valve.mixin';
import uAppClusterSelect from 'kubecube/component/global/header/u-app-cluster-single.vue';
const bgImage = require('../../assets/empty.png');
const links = [
    { name: 'deployments', text: 'Deployments' },
    { name: 'pods', text: 'Pods' },
    { name: 'ingresses', text: 'Ingresses' },
    { name: 'statefullsets', text: 'Statefullsets' },
    { name: 'services', text: 'Services' },
    { name: 'cephs', text: '存储声明' },
];
const promequery = {
    cpuReqUsed: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="requests.cpu",type="used"}',
    cpuReqHard: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="requests.cpu",type="hard"}',
    cpuLimitUsed: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="limits.cpu",type="used"}',
    cpuLimitHard: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="limits.cpu",type="hard"}',
    cpuRequestUsedRate: 'sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster="$cluster", namespace="$namespace"}) / sum(kube_pod_container_resource_requests{cluster="$cluster", namespace="$namespace", resource="cpu"})',
    cpuRequestHardRate: 'sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{cluster="$cluster", namespace="$namespace"}) / sum(kube_pod_container_resource_limits{cluster="$cluster", namespace="$namespace", resource="cpu"})',
    memReqUsed: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="requests.memory",type="used"}',
    memReqHard: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="requests.memory",type="hard"}',
    memLimitUsed: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="limits.memory",type="used"}',
    memLimitHard: 'kube_resourcequota{cluster="$cluster",namespace="$namespace",resource="limits.memory",type="hard"}',
    memRequestUsedRate: 'sum(container_memory_working_set_bytes{cluster="$cluster", namespace="$namespace",container!="", image!=""}) / sum(kube_pod_container_resource_requests{cluster="$cluster", namespace="$namespace", resource="memory"})',
    memRequestHardRate: 'sum(container_memory_working_set_bytes{cluster="$cluster", namespace="$namespace",container!="", image!=""}) / sum(kube_pod_container_resource_limits{cluster="$cluster", namespace="$namespace", resource="memory"})',
    persistentvolumeclaims: 'count (kube_persistentvolumeclaim_labels{cluster="$cluster",namespace="$namespace"})',
    services: 'count (kube_service_labels{cluster="$cluster",namespace="$namespace"})',
    ingresses: 'count (kube_ingress_labels{cluster="$cluster",namespace="$namespace"})',
    deployments: 'count (kube_deployment_labels{cluster="$cluster",namespace="$namespace"})',
    statefullsets: 'count (kube_statefulset_labels{cluster="$cluster",namespace="$namespace"})',
    pods: 'count (kube_pod_labels{cluster="$cluster",namespace="$namespace"})',
    daemonsets: 'count (kube_daemonset_labels{cluster="$cluster",namespace="$namespace"})',
    cronjobs: 'count (kube_cronjob_labels{cluster="$cluster",namespace="$namespace"})',
    jobs: 'count (kube_job_labels{cluster="$cluster",namespace="$namespace"})',
};
export default {
    metaInfo: {
        title: '我的空间 - kubecube',
    },
    filters: {
        percentageFilter(val) {
            return `${`${(val * 100).toFixed(3)}`.slice(0, 4)}%`;
        },
        niceBytes(val) {
            return niceBytes(val).split(/\s+/)[0];
        },
        niceBytesUnit(val) {
            return niceBytes(val).split(/\s+/)[1];
        },
    },
    components: {
        uAppClusterSelect,
    },
    extends: valveMixin,
    data: () => ({
        items: [],
        name: 'namespacepanel',
        links,
        pipeloading: true,
        bgImage,
    }),
    computed: {
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        namespace: sync('scope/namespace'),
        cluster: get('scope/cluster@value'),
        pageIdentifier: get('scope/pageIdentifier'),
    },
    mounted() {
        this.$on('pipestatechange', val => {
            this.pipeloading = val;
        });
    },
    methods: {
        async request() {
            try {
                if (!this.cluster || !this.tenant) {
                    this.namespace = null;
                    // debugger
                    // this.$router.replace(this.$route.path);
                    return;
                }
                this.namespaceLoading = true;
                const params = {
                    labelSelector: [],
                };
                if (this.tenant) {
                    params.labelSelector.push(`kubecube-tenant-${this.tenant}.tree.hnc.x-k8s.io/depth=2`);
                }
                if (this.project) {
                    params.labelSelector.push(`kubecube-project-${this.project}.tree.hnc.x-k8s.io/depth=1`);
                }
                params.labelSelector = params.labelSelector.join(',');
                const response = await nsService.getNamespaces({
                    pathParams: {
                        cluster: this.cluster,
                    },
                    params,
                });
                const time = Date.now() / 1000;
                const query = Object.keys(promequery).map(k => {
                    return {
                        key: k,
                        queryFunc: resolveTemplate(promequery[k]),
                        time,
                    };

                });
                this.items = response.items.map(i => {
                    const name = getFunc(i, 'metadata.name', '');
                    return {
                        text: name,
                        value: name,
                        ...i,
                        query,
                    };
                });
                this.namespaceLoading = false;
                this.replaceToContorlQuery();
            } catch (err) {
                console.log(err);
                this.items = [];
                // this.$router.push({
                //     path: '/empty',
                // });
            }
        },
        monitorService(p) {
            return () => Promise.all(p.query.map(q => {
                return monitorService.queryInstant({
                    params: {
                        query: q.queryFunc({
                            cluster: this.cluster,
                            namespace: p.metadata.name,
                        }),
                        time: q.time,
                    },
                }).then(r => ({
                    [q.key]: +(getFunc(r, 'data.result[0].value[1]') || 0),
                })).catch(() => ({
                    [q.key]: 0,
                }));
            }));
        },
        resolver(response) {
            console.log(response);
            const obj = {};
            response.forEach(o => {
                Object.assign(obj, o);
            });
            return obj;
        },
        toWorkloads(ns, workload) {
            this.namespace = ns;
            this.$router.push({
                path: `/control/${workload}/list`,
                query: {
                    tenant: this.tenant,
                    project: this.project,
                    cluster: this.cluster,
                    namespace: ns.value,
                },
            });
        },
        toNamespace(ns) {
            this.namespace = ns;
            this.$router.push({
                path: '/control',
                query: {
                    tenant: this.tenant,
                    project: this.project,
                    cluster: this.cluster,
                    namespace: ns.value,
                },
            });
        },
        onClick($event, link, ns) {
            $event.stopPropagation();
            this.namespace = ns;
            this.$router.push({
                path: `/control/${link.name}`,
                query: {
                    tenant: this.tenant,
                    project: this.project,
                    cluster: this.cluster,
                    namespace: ns.value,
                },
            });
        },
        replaceToContorlQuery() {
            const query = this.$route.query;
            const nextQ = {
                tenant: this.tenant,
                project: this.project,
                cluster: this.cluster,
            };
            if (JSON.stringify(query) !== JSON.stringify(nextQ)) {
                this.$router.replace({
                    query: nextQ,
                }, 'origin');
            }
        },
    },
};
</script>

<style module>
.container{
    height: 100%;
    overflow: scroll;
    background: #F2F3F8;
}
.root{
    min-width: 1380px;
    padding: 60px 120px;
}
.grid{
    margin-top: 50px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 66px;
    row-gap: 50px;
}
.panel{
    background: #FFFFFF;
    transition: all .3s;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0,0,0,0);
}
.panel:hover{
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
}
.panel > .header{
    font-size: 21px;
    padding: 19px 32px;
    border-bottom: 1px solid #D8D8D8;
}
.panel > .body{
    padding: 16px 32px;
}

.panel > .body .title {
    text-align: center;
    background: #F7F8FA;
    color: #000;
    font-weight: 300;
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    padding: 11px 0;
}

.panel > .body .content {
    display: flex;
    flex-direction: row;
    padding: 20px 0;
}
.panel > .body .content > div{
    flex: 1;
}
.panel > .body .content .subtitle{
   color: #999999;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    font-weight: normal;
    font-size: .8em;
}

.panel > .body .content .value{
    text-align: center;
    font-size: 1.5em;
    font-weight: 400;
    color: #303B61;
}

.panel > .body .content sub{
    bottom: 0;
    font-size: .6em;
    font-weight: lighter;
}

.workloads {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 20px;
}
.workloads > div {
   padding: 6px 0 6px 0;
}
.workloads > div > a:hover {
   text-decoration: underline;
}

.link{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.block{
    margin-top: -40px;
    padding: 19px 33px;
    background: #fff;
}
.empty{
    margin-top: 20px;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #BFBFBF;
    height: calc(100vh - 260px);
}
.empty > .icon{
    text-align: center;
}
</style>
