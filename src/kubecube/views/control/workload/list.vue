<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout direction="horizontal">
      <u-button
        icon="create"
        color="primary"
        :disabled="isReview"
        @click="toCreate"
      >
        部署
      </u-button>
      <u-button
        icon="refresh"
        square
        @click="refresh"
      />
      <kube-input-search
        :align-right="true"
        placeholder="请输入名称搜索"
        @search="onSearch"
      />
    </u-linear-layout>

    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          :resizable="true"
          @sort="onSort"
        >
          <template #[`column.status`]="{ column }">
            {{ column.title }}
            <u-note v-if="workload === 'deployments'">
              <div>工作负载状态给出工作负载各个副本的状态统计</div>
              <div>desired：预期的副本数</div>
              <div>updated：已经是最新版本的副本数</div>
              <div>available：可用副本数</div>
              <div>unavailable：不可用副本数</div>
              <div>total：总副本数</div>
            </u-note>
            <u-note v-if="workload === 'statefullsets'">
              <div>状态信息给出副本的状态统计数据</div>
              <div>desired：预期的副本数</div>
              <div>total：总副本数</div>
            </u-note>
          </template>
          <template #[`item.name`]="{ item }">
            <u-link :to="{path: `/control/${workload}/${item.metadata.name}`}">
              {{ item.metadata.name }}
            </u-link>
          </template>
          <template #[`item.status`]="{ item }">
            <template v-if="['deployments', 'statefullsets'].includes(workload)">
              <u-tooltip>
                <u-status-icon :name="getStatus(item)" />
                <div
                  v-if="item.podStatus.warning && item.podStatus.warning.length"
                  slot="content"
                >
                  <span
                    v-for="(warn, idx) in item.podStatus.warning"
                    :key="idx"
                    :class="$style.podStatus"
                  >
                    {{ warn.message }}
                  </span>
                  <!-- <u-link v-if="props.row.pods.warnings.length > 1" @click="showMore(props.row)">更多</u-link> -->
                </div>
              </u-tooltip>
            </template>
            {{ item.status | statusFilter(workload) }}
          </template>
          <template #[`item.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.jobstatus`]="{ item }">
            {{ item.status.succeeded }} / {{ item.spec && item.spec.completions }}
          </template>
          <template #[`item.period`]="{ item }">
            {{ getJobPeriod(item) }}
          </template>

          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list :key="workload">
                <template v-if="workload === 'jobs'">
                  <u-link-list-item
                    :disabled="isReview"
                    @click="deleteItem(item)"
                  >
                    删除
                  </u-link-list-item>
                </template>
                <template v-if="['cronjobs', 'daemonsets'].includes(workload)">
                  <u-link-list-item
                    :disabled="isReview"
                    @click="toEditItem(item)"
                  >
                    设置
                  </u-link-list-item>
                  <u-link-list-item
                    :disabled="isReview"
                    @click="deleteItem(item)"
                  >
                    删除
                  </u-link-list-item>
                  <u-link-list-item
                    :disabled="isReview"
                    @click="editYAML(item)"
                  >
                    YAML 设置
                  </u-link-list-item>
                </template>
                <template v-if="['deployments','statefulsets'].includes(workload)">
                  <u-link-list-item
                    :disabled="isReview"
                    @click="toEditItem(item)"
                  >
                    设置
                  </u-link-list-item>
                  <u-link-list-item
                    :disabled="isReview"
                    @click="resize(item)"
                  >
                    调整副本数
                  </u-link-list-item>
                  <!-- <u-link-list-item
                    v-if="workload === 'deployments'"
                    to="deployment.updateImage"
                  >
                    滚动更新
                  </u-link-list-item> -->
                  <u-link-list-item
                    :disabled="isReview"
                    @click="deleteItem(item)"
                  >
                    删除
                  </u-link-list-item>
                  <!-- <u-link-list-item>
                    设置
                  </u-link-list-item> -->
                  <u-link-list-item
                    :disabled="isReview"
                    @click="editYAML(item)"
                  >
                    YAML 设置
                  </u-link-list-item>
                </template>
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              没有搜索到相关内容，可调整关键词重新搜索
            </template>
            <template v-else>
              还没有任何 {{ workloadLiteral }} , 现在就 <u-link
                :disabled="isReview"
                @click="toCreate"
              >
                立即创建
              </u-link> 一个吧。
            </template>
          </template>
        </kube-table>
        <u-page
          v-if="data && calculatePages(data.total) > 1"
          :count="data.total"
          :page-size="pagenation.pageSize"
          :total="calculatePages(data.total)"
          @select="selectPage"
        />
      </template>
    </x-request>
    <modify-replicas-dialog
      ref="modifyDialog"
      @refresh="refresh"
    />
  </u-linear-layout>
</template>

<script>
import { upperFirst } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toDeploymentPlainObject } from 'kubecube/k8s-resources/deployment';
import { toPlainObject as toStatefulsetPlainObject } from 'kubecube/k8s-resources/statefulset';
import { toPlainObject as toDaemonsetPlainObject } from 'kubecube/k8s-resources/daemonsets';
import { toPlainObject as toJobPlainObject } from 'kubecube/k8s-resources/job';
import { toPlainObject as toCronJobPlainObject } from 'kubecube/k8s-resources/cronjob';
// import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import modifyReplicasDialog from './detail/dialog/modify-replicas.vue';

import {
    JOB_STATUS_MAP,
} from 'kubecube/utils/constance';
import {
    getPeriod,
} from 'kubecube/utils/functional';
export default {
    metaInfo() {
        return {
            title: `${this.workload} - kubecube`,
        };
    },
    components: {
        modifyReplicasDialog,
    },
    filters: {
        statusFilter(status, workload) {
            switch (workload) {
                case 'deployments':
                    return `${status.desired} desired, ${status.updated} updated, ${status.available} available, ${status.unavailable} unavailable, ${status.total} total`;
                case 'statefulsets':
                    return `${status.desired} desired, ${status.total} total`;
                case 'jobs':
                    return (JOB_STATUS_MAP[status.runningStatus] || JOB_STATUS_MAP.Pending).text;
                default:
                    return '-';
            }

        },
    },
    mixins: [ PageMixin ],
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userRole: get('scope/userRole'),
        isReview() {
            return !(this.userRole.tenantAdmin || this.userRole.projectAdmin || this.userRole.platformAdmin);
        },
        workload() {
            return this.$route.params.workload;
        },
        workloadLiteral() {
            return upperFirst(this.$route.params.workload);
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
        columns() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                    return [
                        { title: '名称', name: 'name', sortable: true },
                        { title: '状态', name: 'status', width: '360px' },
                        { title: '创建时间', name: 'creationTimestamp', width: '200px', sortable: true },
                        { title: '操作', name: 'operation', sortable: false, width: '200px' },
                    ];
                case 'daemonsets':
                    return [
                        { title: '名称', name: 'name', sortable: true },
                        { title: '级别', name: 'level', width: '320px' },
                        { title: '创建时间', name: 'creationTimestamp', width: '200px', sortable: true },
                        { title: '操作', name: 'operation', sortable: false, width: '200px' },
                    ];
                case 'jobs':
                    return [
                        { title: '名称', name: 'name', sortable: true },
                        { title: '状态', name: 'status', width: '160px' },
                        { title: '执行情况（完成/全部）', name: 'jobstatus', width: '200px', sortable: true },
                        { title: '运行时长', name: 'period', width: '160px', sortable: true },
                        { title: '操作', name: 'operation', sortable: false, width: '100px' },
                    ];
                case 'cronjobs':
                    return [
                        { title: '名称', name: 'name', sortable: true },
                        { title: '空间', name: 'metadata.namespace', width: '160px' },
                        { title: '状态', name: 'status.runningStatus', width: '80px' },
                        { title: '定时调度设置', name: 'spec.schedule', width: '120px' },
                        { title: '正在运行任务数', name: 'status.tasks', width: '120px' },
                        { title: '创建时间', name: 'creationTimestamp', width: '160px' },
                        { title: '操作', name: 'operation', width: '160px' },
                    ];
                default:
                    return [];
            }
        },
        toPlainObject() {
            switch (this.workload) {
                case 'deployments':
                    return toDeploymentPlainObject;
                case 'statefulsets':
                    return toStatefulsetPlainObject;
                case 'jobs':
                    return toJobPlainObject;
                case 'cronjobs':
                    return toCronJobPlainObject;
                case 'daemonsets':
                    return toDaemonsetPlainObject;
                default:
                    return () => ({});
            }
        },
        // toStatuPlainObject() {
        //     switch (this.workload) {
        //         case 'deployments':
        //             return toDeploymentStatusPlainObject;
        //         case 'statefulsets':
        //             return toStatefulsetStatusPlainObject;
        //         case 'jobs':
        //             return toJobStatusPlainObject;
        //         default:
        //             return () => ({});
        //     }
        // },
        service() {
            switch (this.workload) {
                case 'deployments':
                    return workloadExtendService.getWorkloads;
                case 'statefulsets':
                    return workloadService.getWorkloads;
                case 'jobs':
                    return workloadService.getBatchs;
                case 'cronjobs':
                    return workloadService.getBatchsBeta;
                default:
                    return workloadService.getWorkloads;
            }
        },
        createInstanceService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.createWorkload;
                case 'jobs':
                    return workloadService.createBatchs;
                case 'cronjobs':
                    return workloadService.createBatchsBeta;
                default:
                    return null;
            }
        },
        instanceService() {
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
                    return workloadService.getAPIV1Instance;
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
                    return workloadService.deleteAPIV1Instance;
                default:
                    return null;
            }
        },
        // modifyService() {
        //     switch (this.workload) {
        //         case 'deployments':
        //         case 'statefulsets':
        //             return workloadService.modifyWorkload;
        //         case 'jobs':
        //             return workloadService.getBatchInstance;
        //         case 'cronjobs':
        //             return workloadService.getBatchsBetaInstance;
        //         case 'pods':
        //             return workloadService.getAPIV1Instance;
        //         default:
        //             return null;
        //     }
        // },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        getStatus(item) {
            if ((item.podStatus.warning || []).length > 0 || item.spec.replicas === 0) { return 'warning'; }
            if (item.podStatus.pending > 0) { return 'waiting'; }
            return 'success';
        },
        getJobPeriod(item) {
            let period = '';
            if (item.status && item.status.startTime) {
                const { startTime, completionTime } = item.status;
                period = completionTime ? getPeriod(startTime, completionTime) : getPeriod(startTime);
            }
            return period;

        },
        resolver(response) {
            console.log(response);

            return {
                list: (response.items || []).map(this.toPlainObject),
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = `metadata.${name}`;
            this.pagenation.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            this.pagenation.selector = content ? `metadata.name~${content}` : undefined;
        },
        toCreate() {
            // let content;
            // switch (this.workload) {
            //     case 'deployments':
            //         content = {
            //             apiVersion: 'apps/v1',
            //             kind: 'Deployment',
            //         };
            //         break;
            //     case 'statefulsets':
            //         content = {
            //             apiVersion: 'apps/v1',
            //             kind: 'StatefulSet',
            //         };
            //         break;
            //     case 'jobs':
            //         content = {
            //             apiVersion: 'apps/v1',
            //             kind: 'Job',
            //         };
            //         break;
            //     case 'cronjobs':
            //         content = {
            //             apiVersion: 'apps/v1',
            //             kind: 'CronJob',
            //         };
            //         break;
            //     default:
            //         content = {};
            // }
            // this.$editResource({
            //     title: `${this.workload} —— YAML 设置`,
            //     content,
            //     onSubmit: async content => {
            //         console.log(content);
            //         await this.createInstanceService({
            //             pathParams: {
            //                 cluster: this.cluster,
            //                 namespace: this.namespace,
            //                 resource: this.workload,
            //             },
            //             data: content,
            //         });
            //         this.refresh();
            //     },
            // });
            this.$router.push({
                path: `/control/${this.workload}/create`,
            });
        },
        toEditItem(item) {
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/edit`,
            });
        },
        resize(item) {
            this.$refs.modifyDialog.open(item);
        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: this.workload,
                            name: item.metadata.name,
                        },
                    };
                    await this.deleteService(reqParam);
                    this.$refs.request.request();
                },
            });
        },
        async editYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: item.metadata.name,
                },
            };
            const response = await this.instanceService(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— YAML 设置`,
                content: response,
                onSubmit: async content => {
                    console.log(content);
                    await workloadService.modifyWorkload({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
    },
};
</script>

<style module>
.podStatus{
    display: block;
}
</style>
