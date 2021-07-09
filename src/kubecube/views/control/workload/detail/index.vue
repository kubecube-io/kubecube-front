<template>
  <div>
    <router-view
      v-if="needTransparent"
    />
    <template v-else>
      <u-head-card
        v-if="workload !== 'pods' && !withInstanceTransparent"
        :title="name"
      >
        <div slot="logo">
          {{ (name || '').substring(0, 2).toUpperCase() }}
        </div>
        <div slot="act">
          <u-detail-operate>
            <template v-if="['deployments', 'statefullsets'].includes(workload)">
              <u-detail-operate-item @click="toResize">
                调整副本数
              </u-detail-operate-item>
            </template>
            <!-- <u-detail-operate-item
              v-if="moduleName === 'deployment'"
              :to="{name: 'deployment.updateImage', query: { name, nsName } }"
            >
              滚动更新
            </u-detail-operate-item> -->
            <u-detail-operate-item @click="deleteItem">
              删除
            </u-detail-operate-item>
            <u-detail-operate-item @click="editItem">
              设置
            </u-detail-operate-item>
            <u-detail-operate-item @click="editYAML">
              YAML 设置
            </u-detail-operate-item>
          <!-- </template>
          <template v-else>
            <u-detail-operate-item @click="deleteItem">
              删除
            </u-detail-operate-item>
          </template> -->
          </u-detail-operate>
        </div>
      </u-head-card>
      <x-request
        ref="request"
        :service="service"
        :params="requestParam"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <u-loading v-if="loading" />
          <div v-else-if="error">
            加载出错！
          </div>
          <template v-else-if="withInstanceTransparent">
            <router-view :instance="data" />
          </template>
          <template v-else>
            <u-tabs router>
              <u-tab
                v-for="(item, index) in getTabs(data)"
                :key="index"
                :value="item"
                :title="item.title"
                :to="item.route"
              />
            </u-tabs>
            <router-view :instance="data" />

            <modify-replicas-dialog
              ref="modifyDialog"
              :instance="data"
              @refresh="refresh"
            />
          </template>
        </template>
      </x-request>
    </template>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toDepPlainObject,
} from 'kubecube/k8s-resources/deployment/index.js';
import {
    toPlainObject as toStatefulsetPlainObject,
} from 'kubecube/k8s-resources/statefulset/index.js';
import {
    toPlainObject as toDaemonsetPlainObject,
} from 'kubecube/k8s-resources/daemonsets/index.js';
import {
    toPlainObject as toJobPlainObject,
} from 'kubecube/k8s-resources/job/index.js';
import {
    toPlainObject as toCronJobPlainObject,
} from 'kubecube/k8s-resources/cronjob';
import {
    toPlainObject as toPodPlainObject,
} from 'kubecube/k8s-resources/pod/index.js';
import {
    toPlainObject as toServicePlainObject,
} from 'kubecube/k8s-resources/service/index.js';
import {
    toPlainObject as toIngressPlainObject,
} from 'kubecube/k8s-resources/ingress';
import {
    toPlainObject as toPVCPlainObject,
} from 'kubecube/k8s-resources/persistentvolumeclaim';
import {
    toPlainObject as toConfigmapPlainObject,
} from 'kubecube/k8s-resources/configmap';
import {
    toPlainObject as toSecretPlainObject,
} from 'kubecube/k8s-resources/secret';
import {
    toPlainObject as toLogconfgPlainObject,
} from 'kubecube/k8s-resources/logconfigs';
import {
    toPlainObject as toPrometheusRulePlainObject,
} from 'kubecube/k8s-resources/prometheusRule';
import {
    rulespecCRD,
} from 'kubecube/views/control/observable/utils.js';
import modifyReplicasDialog from './dialog/modify-replicas.vue';
export default {
    metaInfo() {
        return {
            title: `${this.name} - kubecube`,
        };
    },
    components: {
        modifyReplicasDialog,
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        name() {
            return this.$route.params.instance;
        },
        workload() {
            return this.$route.params.workload;
        },
        service() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.getInstance;
                case 'jobs':
                    return workloadService.getBatchInstance;
                case 'cronjobs':
                    return workloadService.getBatchsBetaInstance;
                case 'pods':
                case 'services':
                case 'persistentvolumeclaims':
                case 'secrets':
                case 'configmaps':
                    return workloadService.getAPIV1Instance;
                case 'ingresses':
                    return workloadService.getNetworkingInstance;
                case 'logconfigs':
                    return workloadService.getNeteaseResourceInstance;
                case 'PrometheusRule':
                    return workloadService.getNamespaceCRResourceInstance;
                default:
                    return null;
            }
        },
        deleteService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.deleteInstance;
                case 'jobs':
                    return workloadService.deleteBatchInstance;
                case 'cronjobs':
                    return workloadService.deleteBatchsBetaInstance;
                case 'pods':
                case 'services':
                case 'persistentvolumeclaims':
                case 'secrets':
                case 'configmaps':
                    return workloadService.deleteAPIV1Instance;
                case 'ingresses':
                    return workloadService.deleteNetworkingInstance;
                case 'logconfigs':
                    return workloadService.deleteNeteaseResource;
                default:
                    return null;
            }
        },
        modifyService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.modifyWorkload;
                case 'jobs':
                    return workloadService.modifyBatchInstance;
                case 'cronjobs':
                    return workloadService.modifyBatchsBetaInstance;
                case 'pods':
                case 'services':
                case 'persistentvolumeclaims':
                case 'secrets':
                case 'configmaps':
                    return workloadService.modifyAPIV1Instance;
                case 'ingresses':
                    return workloadService.modifyNetworkingInstance;
                case 'logconfigs':
                    return workloadService.modifyNeteaseResource;
                default:
                    return null;
            }
        },
        requestParam() {
            if (this.workload === 'PrometheusRule') {
                return {
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        name: this.name,
                        ...rulespecCRD,
                    },
                };
            }
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.name,
                },
            };
        },
        needTransparent() {
            return this.$route.name === 'control.workload.containerdetail';
        },
        withInstanceTransparent() {
            return this.$route.name === 'control.workload.edit';
        },
    },
    methods: {
        resolver(response) {
            console.log(response);
            switch (this.workload) {
                case 'deployments':
                    return toDepPlainObject(response);
                case 'statefulsets':
                    return toStatefulsetPlainObject(response);
                case 'daemonsets':
                    return toDaemonsetPlainObject(response);
                case 'jobs':
                    return toJobPlainObject(response);
                case 'cronjobs':
                    return toCronJobPlainObject(response);
                case 'pods':
                    return toPodPlainObject(response);
                case 'services':
                    return toServicePlainObject(response);
                case 'ingresses':
                    return toIngressPlainObject(response);
                case 'persistentvolumeclaims':
                    return toPVCPlainObject(response);
                case 'secrets':
                    return toSecretPlainObject(response);
                case 'configmaps':
                    return toConfigmapPlainObject(response);
                case 'logconfigs':
                    return toLogconfgPlainObject(response);
                case 'PrometheusRule':
                    return toPrometheusRulePlainObject(response);
                default:
                    return null;
            }
        },
        getTabs(data) {
            switch (this.workload) {
                case 'pods':
                    return [
                        { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: '监控', route: { name: 'control.workload.monitor', params: this.$route.params } },
                        { title: '事件', route: { name: 'control.workload.event', params: this.$route.params } },
                        { title: 'condition信息', route: { name: 'control.workload.condition', params: this.$route.params } },
                        { title: '日志', route: { name: 'control.workload.log', params: this.$route.params } },
                    ];
                case 'cronjobs':
                    return [
                        { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: '任务列表', route: { name: 'control.workload.jobs', params: this.$route.params } },
                        { title: '事件', route: { name: 'control.workload.event', params: this.$route.params } },
                    ];
                case 'services':
                    if ([ 'normal', 'nodePort', 'loadBalancer' ].includes(data.spec.template)) {
                        return [
                            { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                            { title: '事件', route: { name: 'control.workload.event', params: this.$route.params } },
                            { title: '对外服务端口', route: { name: 'control.workload.external', params: this.$route.params } },
                        ];
                    }
                    return [
                        { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: '事件', route: { name: 'control.workload.event', params: this.$route.params } },
                    ];
                case 'ingresses':
                    return [
                        { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: '事件', route: { name: 'control.workload.event', params: this.$route.params } },
                    ];
                case 'persistentvolumeclaims':
                    return [
                        { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: '监控', route: { name: 'control.workload.monitor', params: this.$route.params } },
                    ];
                case 'secrets':
                case 'configmaps':
                case 'logconfigs':
                    return [
                        { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                    ];
                default:
                    return [
                        { title: '详情', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: '副本', route: { name: 'control.workload.pod', params: this.$route.params } },
                        { title: '监控', route: { name: 'control.workload.monitor', params: this.$route.params } },
                        { title: '事件', route: { name: 'control.workload.event', params: this.$route.params } },
                        { title: 'condition信息', route: { name: 'control.workload.condition', params: this.$route.params } },
                        { title: '日志', route: { name: 'control.workload.log', params: this.$route.params } },
                        // { title: '自动伸缩', path: `/${moduleName}/detail/HPA` },
                        // { title: '性能分析', crd: 'abnormals.diagnosis.netease.com', path: `/${moduleName}/detail/performance` },
                        // { title: '资源推荐', crd: 'verticalpodautoscalers.autoscaling.k8s.io', path: `/${moduleName}/detail/recommand` },
                    ];
            }
        },
        refresh() {
            this.$refs.request.request();
        },
        toResize() {
            this.$refs.modifyDialog.open();
        },
        async editYAML() {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.name,
                },
            };
            const response = await this.service(reqParam);

            this.$editResource({
                title: `${this.name} —— YAML 设置`,
                content: response,
                onSubmit: async content => {
                    console.log(content);
                    await this.modifyService({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
        editItem() {
            this.$router.push({
                path: `/control/${this.workload}/${this.name}/edit`,
            });
        },
        deleteItem() {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${this.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: this.workload,
                            name: this.name,
                        },
                    };
                    await this.deleteService(reqParam);
                    this.$router.push({
                        path: `/control/${this.workload}/list`,
                    });
                },
            });
        },
    },
};
</script>

<style>

</style>
