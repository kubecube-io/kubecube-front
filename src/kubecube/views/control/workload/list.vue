<template>
  <div>
    <el-row :class="$style.root">
      <el-row>
        <el-col>
          <el-button
            type="primary"
            icon="el-icon-plus"
            :disabled="isReview"
            @click="toCreate"
          >
            部署
          </el-button>
          <el-button
            square
            icon="el-icon-refresh-right"
            @click="refresh"
          />
          <elInputSearch
            v-model="filterName"
            placeholder="请输入名称搜索"
            position="right"
            @search="onSearch"
          />
        </el-col>
      </el-row>
      <el-row>
        <x-request
          ref="request"
          :service="service"
          :params="requestParam"
          :processor="resolver"
        >
          <template slot-scope="{ data, loading }">
            <el-table
              :key="workload"
              v-loading="loading"
              :data="data ? data.list : []"
              style="width: 100%"
              border
              :default-sort="defaultSort"
              @sort-change="tableSortChange"
            >
              <template v-if="['statefulsets', 'deployments'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="名称"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query }"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="date"
                  label="镜像"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ calculateImages(row) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="date"
                  label="状态"
                  :width="workload === 'deployments' ? 360 : 180"
                >
                  <template slot="header">
                    状态
                    <el-tooltip
                      class="item"
                      effect="dark"
                      placement="top"
                      popper-class="ncs-el-tooltip-popper"
                    >
                      <div
                        v-if="workload === 'deployments'"
                        slot="content"
                      >
                        <div>工作负载状态给出工作负载各个副本的状态统计</div>
                        <div>desired：预期的副本数</div>
                        <div>updated：已经是最新版本的副本数</div>
                        <div>available：可用副本数</div>
                        <div>unavailable：不可用副本数</div>
                        <div>total：总副本数</div>
                      </div>
                      <div
                        v-if="workload === 'statefulsets'"
                        slot="content"
                      >
                        <div>状态信息给出副本的状态统计数据</div>
                        <div>desired：预期的副本数</div>
                        <div>total：总副本数</div>
                      </div>
                      <i class="el-icon-question" />
                    </el-tooltip>
                  </template>
                  <template slot-scope="{ row }">
                    <statusIcon
                      v-if="getStatus(row) === 'success'"
                      name="success"
                    />
                    <statusIcon
                      v-else-if="!row.podStatus.warning || !row.podStatus.warning.length"
                      name="warning"
                    />
                    <el-tooltip
                      v-else
                      class="item"
                      effect="dark"
                      placement="top"
                      popper-class="ncs-el-tooltip-popper"
                    >
                      <div
                        v-if="row.podStatus.warning && row.podStatus.warning.length"
                        slot="content"
                      >
                        <div
                          v-for="(warn, idx) in row.podStatus.warning"
                          :key="idx"
                        >
                          {{ warn.message }}
                        </div>
                      </div>
                      <statusIcon name="warning" />
                    </el-tooltip>
                    {{ row.status | statusFilter(workload) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="创建时间"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="操作"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="toEditItem(row)"
                      >
                        设置
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="resize(row)"
                      >
                        调整副本数
                      </el-link>
                      <el-link
                        v-if="workload === 'deployments'"
                        :disabled="isReview"
                        type="primary"
                        @click="toUpdateImage(row)"
                      >
                        滚动更新
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="restart(row)"
                      >
                        重建
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        删除
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="editYAML(row)"
                      >
                        YAML 设置
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
              <template v-if="['daemonsets'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="名称"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query}"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="level"
                  label="级别"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.spec.level && (row.spec.level.ind === 'platform' ? '平台级' : '租户级') || '-' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="创建时间"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="操作"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="toEditItem(row)"
                      >
                        设置
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        删除
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="editYAML(row)"
                      >
                        YAML 设置
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
              <template v-if="['cronjobs'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="名称"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query }"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status.runningStatus"
                  label="状态"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.spec.suspend ? '暂停' : '已启动' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="spec.schedule"
                  label="定时设置"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  prop="status.tasks"
                  label="正在运行任务数"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ (row.status.active || []).length }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="创建时间"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="操作"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="toEditItem(row)"
                      >
                        设置
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        删除
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="editYAML(row)"
                      >
                        YAML 设置
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
              <template v-if="['jobs'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="名称"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query }"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="状态"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.status | statusFilter(workload) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="jobstatus"
                  label="执行情况（完成/全部）"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.status.succeeded || 0 }} / {{ row.spec && row.spec.completions }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="period"
                  label="运行时长"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ getJobPeriod(row) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="创建时间"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="操作"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        删除
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            <el-pagination
              v-if="data && calculatePages(data.total) > 0"
              style="float:right;margin-top:12px"
              :current-page="pagenation.pageNum"
              :page-sizes="[10, 20, 30, 40, 50, 100]"
              :page-size="pagenation.pageSize"
              layout="total, sizes, prev, pager, next"
              :total="data.total"
              background
              @size-change="pageSizeChange"
              @current-change="pageNumChange"
            />
          </template>
        </x-request>
      </el-row>
    </el-row>
    <modify-replicas-dialog
      ref="modifyDialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { upperFirst } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import { toPlainObject as toDeploymentPlainObject } from 'kubecube/k8s-resources/deployment';
import { toPlainObject as toStatefulsetPlainObject } from 'kubecube/k8s-resources/statefulset';
import { toPlainObject as toDaemonsetPlainObject } from 'kubecube/k8s-resources/daemonsets';
import { toPlainObject as toJobPlainObject } from 'kubecube/k8s-resources/job';
import { toPlainObject as toCronJobPlainObject } from 'kubecube/k8s-resources/cronjob';
// import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import modifyReplicasDialog from './detail/dialog/modify-replicas.vue';
import { pagenationMixin } from 'kubecube/mixins';

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
    mixins: [ pagenationMixin ],
    data() {
        return {
            filterName: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userRole: get('scope/userRole'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission[this.workload];
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
        toUpdateImage(item) {
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/updateImage`,
            });
        },
        async restart(item) {
            await workloadService.patchWorkload({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: item.metadata.name,
                },
                data: {
                    spec: {
                        template: {
                            metadata: {
                                annotations: {
                                    'kubectl.kubernetes.io/restartedAt': `${new Date().toLocaleString()}`,
                                },
                            },
                        },
                    },
                },
            });
            this.$message({
                message: '已触发重建',
                type: 'success',
            });
            this.refresh();
        },
        calculateImages(item) {
            return item.containers.map(item => item.image).join(', ');
        },
        getStatus(item) {
            console.log(item.status);
            if ((item.podStatus.warning || []).length > 0 || item.status.desired !== item.status.readyReplicas) { return 'warning'; }
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
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagenation.selector === temp) {
                this.refresh();
            }
            this.pagenation.selector = temp;
        },
        toCreate() {
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
            this.$eConfirm({
                title: '删除',
                message: `确认要删除 ${item.metadata.name} 吗？`,
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
.podStatus{
    display: block;
}
.root :global(.el-row) + :global(.el-row) {
  margin-top: 12px;
}
</style>
