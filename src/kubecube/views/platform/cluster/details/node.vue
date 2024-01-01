<template>
  <div>
    <div style="margin-bottom: 12px;">
      <el-button
        type="primary"
        @click="$refs.nodedialog.open()"
        icon="el-icon-plus"
      >
        添加节点
      </el-button>
      <el-button @click="refresh" square icon="el-icon-refresh-right"></el-button>
      <nodeInputSearch
        :align-right="true"
        @search="onSearch"
        :nodeStatusMap="nodeStatusMap"
      />
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :class="$style.table"
          :data="data ? data.list : []"
          style="width: 100%"
          border
          @sort-change="tableSortChange"
        >
          <el-table-column
            prop="metadata.name"
            label="名称"
            :show-overflow-tooltip="true"
            sortable
          >
            <template slot-scope="{ row }">
              <div>
                <el-tooltip v-if="row.metadata.labels.find(i => i.key === 'node-role.kubernetes.io/master')" class="item" effect="dark" content="master 节点" placement="bottom">
                  <span :class="$style.master_flag">控</span>
                </el-tooltip>
                <el-link type="primary" :to="{ path: `/platform/cluster/${instance.clusterName}/${row.metadata.name}` }">
                  {{ row.metadata.name }}
                </el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="status.nodeIP"
            label="IP"
            :show-overflow-tooltip="true"
            width="120"
            sortable
          />
          <el-table-column
            prop="status.capacity.cpu"
            label="CPU"
            :show-overflow-tooltip="true"
            width="80"
          >
            <template slot-scope="{ row }">
              {{ row.status.capacity.cpu | cpuFilter }} Cores
            </template>
          </el-table-column>
          <el-table-column
            prop="status.capacity.memory"
            label="内存"
            :show-overflow-tooltip="true"
            width="80"
          >
            <template slot-scope="{ row }">
              {{ row.status.capacity.memory | memoryFilter }} GiB
            </template>
          </el-table-column>
          <el-table-column
            prop="status.capacity['nvidia.com/gpu']"
            label="GPU"
            :show-overflow-tooltip="true"
            width="60"
          >
            <template slot-scope="{ row }">
              {{ row.status.capacity['nvidia.com/gpu'] || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="metadata.labels"
            label="标签"
            :show-overflow-tooltip="true"
            width="180"
          >
            <template slot-scope="{ row }">
              <tagList :data="row.metadata.labels" :itemFormatter="(i) => `${i.key}:${i.value}`"/>
            </template>
          </el-table-column>
          <el-table-column
            prop="spec.type"
            label="节点类型"
            :show-overflow-tooltip="true"
            width="70"
          >
          </el-table-column>
          <el-table-column
            prop="spec.unschedulable"
            label="可调度"
            :show-overflow-tooltip="true"
            width="60"
          >
            <template slot-scope="{ row }">
              {{ row.spec.unschedulable ? '不可调度' : '可调度' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status.statusText"
            label="状态"
            :show-overflow-tooltip="true"
            width="60"
          >
            <template slot-scope="{ row }">
              {{ row.status.statusText | nodeStatusFilter }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="操作"
            :show-overflow-tooltip="true"
            width="200"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link
                  type="primary"
                  @click="openLabelsModal(row)"
                >
                  编辑标签
                </el-link>
                <el-link
                  type="primary"
                  @click="schedule(row)"
                >
                  {{ !row.spec.unschedulable ? '禁止' : '允许' }}调度
                </el-link>
                <el-link
                  type="primary"
                  @click="setTaints(row)"
                >
                  设置污点
                </el-link>
                <el-link
                  type="primary"
                  @click="drainItem(row)"
                >
                  平滑迁移
                </el-link>
                <el-link
                  type="primary"
                  :disabled="isDeleteForbidden(row)"
                  @click="deleteItem(row)"
                >
                  删除
                </el-link>
              </qz-link-group>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="float:right;margin-top:12px"
          v-if="data && calculatePages(data.total) > 0"
          @size-change="pageSizeChange"
          @current-change="pageNumChange"
          :current-page="pagenation.pageNum"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="pagenation.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="data.total"
          background
        />
      </template>
    </x-request>
    <taint-dialog
      ref="taintdialog"
      :instance="instance"
      @refresh="refresh"
    />
    <nodeDialog
      ref="nodedialog"
      :instance="instance"
      @refresh="refresh"
    />
    <labelDialog
      ref="labelDialog"
      :instance="instance"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import {
    toPlainObject as toNodePlainObject,
} from 'kubecube/k8s-resources/node';
import {
    toPlainObject as toMetadataPlainObject,
} from 'kubecube/k8s-resources/metadata';
import taintDialog from '../dialogs/taint.vue';
import nodeDialog from '../dialogs/node.vue';
import labelDialog from '../dialogs/labels.vue';
const formatter = item => `${item.key}: ${item.value}`;
import { unitConvertMemory, unitConvertCPU } from 'kubecube/utils/functional';
import nodeInputSearch from './component/node-input-serch.vue';
const nodeStatusMap = {
    unscheduled: '维护中',
    normal: '正常',
    abnormal: '异常',
};
export default {
    components: {
        taintDialog,
        nodeDialog,
        labelDialog,
        nodeInputSearch,
    },
    filters: {
        cpuFilter(cpu) {
            return Number(unitConvertCPU(`${cpu}`)).toFixed(2); // m -> plain
        },
        memoryFilter(memory) {
            return Number(`${unitConvertMemory(`${memory}`, 'Gi')}`).toFixed(2); // Mi --> Gi
        },
        nodeStatusFilter(val) {
            return nodeStatusMap[val] || val || '-';
        },
    },
    mixins: [ PageMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            nodeStatusMap,
            service: workloadExtendService.getResourceListWithoutNamespace,
            selectRows: [],
            // columns: [
            //     { type: 'selection', width: '60px' },
            //     { title: '名称', name: 'metadata.name', sortable: true },
            //     { title: 'IP', name: 'status.nodeIP', width: '120px', sortable: true },
            //     { title: 'CPU', name: 'status.capacity.cpu', width: '80px' },
            //     { title: '内存', name: 'status.capacity.memory', width: '80px' },
            //     { title: 'GPU', name: 'status.capacity["nvidia.com/gpu"]', width: '60px' },
            //     { title: '标签', name: 'metadata.labels', type: 'tag', width: '180px', cellprops: { hasModal: true, isChip: true, formatter } },
            //     { title: '节点类型', name: 'spec.type', width: '70px' },
            //     { title: '可调度', name: 'spec.unschedulable', width: '60px' },
            //     { title: '状态', name: 'status.statusText', width: '60px' },
            //     { title: '操作', name: 'operation', width: '180px' },
            // ],
        };
    },
    computed: {
        isControlCluster() {
            return !this.instance.isMemberCluster;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'nodes',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
        clusterName() {
            return this.$route.params.name;
        },
        columns() {
            return [
                { title: '名称', name: 'metadata.name', sortable: true },
                { title: 'IP', name: 'status.nodeIP', width: '120px', sortable: true },
                { title: 'CPU', name: 'status.capacity.cpu', width: '80px' },
                { title: '内存', name: 'status.capacity.memory', width: '80px' },
                { title: 'GPU', name: 'status.capacity["nvidia.com/gpu"]', width: '60px' },
                { title: '标签', name: 'metadata.labels', type: 'tag', width: '180px', cellprops: { hasModal: true, isChip: true, formatter } },
                { title: '节点类型', name: 'spec.type', width: '70px' },
                { title: '可调度', name: 'spec.unschedulable', width: '60px' },
                { title: '状态', name: 'status.statusText', width: '60px' },
                { title: '操作', name: 'operation', width: '180px' },
            ];
        },
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            return {
                list: response.items.map(toNodePlainObject),
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = `${name}`;
            this.pagenation.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch({ value, valueType }) {
            if (valueType === 'name') {
                this.pagenation.selector = value ? `metadata.name~${value}` : undefined;
            }
            if (valueType === 'label') {
                this.pagenation.selector = value ? `metadata.labels.${value}` : undefined;
            }
            if (valueType === 'status') {
                this.pagenation.selector = value ? `extendInfo.status=${value}` : undefined;
            }
        },
        onSelectionChange($event) {
            this.selectRows = $event;
        },
        openLabelsModal(item) {
            this.$refs.labelDialog.open(item);
        },
        schedule(item) {
            if (!item.spec.unschedulable) {
                this.$eConfirm({
                    message: '确定禁止工作负载调度到该节点吗？',
                    title: '提示',
                    ok: async () => {
                        await this.modifyNode(item, { spec: { unschedulable: true } });
                    },
                });
            } else {
                this.modifyNode(item, { spec: { unschedulable: false } });
            }
        },
        async modifyNode(item, patch) {
            await workloadService.modifyResourceWithoutNamespace({
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'nodes',
                    name: get(item, 'metadata.name'),
                },
                data: patch,
            });
            this.refresh();
        },
        setTaints(item) {
            this.$refs.taintdialog.open(item);
        },
        drainItem(item) {
            this.$eConfirm({
                message: `确定迁移节点 ${item.metadata.name} 吗？`,
                subMessage: '平滑迁移会驱逐节点上的所有Pod，请确保有合适的节点可供调度。',
                title: '平滑迁移',
                ok: async () => {
                    const pods = await workloadService.getResourceListWithoutNamespace({
                        pathParams: {
                            cluster: this.instance.clusterName,
                            resource: 'pods',
                        },
                        params: {
                            fieldSelector: `spec.nodeName=${item.metadata.name}`,
                            pageSize: 10000,
                        },
                    });
                    const pod = pods.items.map(toMetadataPlainObject).filter(i => ![ 'kube-public', 'kube-system' ].includes(i.namespace) && _.get(i, 'ownerReferences[0].kind') !== 'DaemonSet');
                    await Promise.all(pod.map(p => new Promise(async (r, j) => {
                        try {
                            await workloadService.eviction({
                                pathParams: {
                                    cluster: this.instance.clusterName,
                                    namespace: p.namespace,
                                    name: p.name,
                                },
                                data: {
                                    apiVersion: 'policy/v1beta1',
                                    kind: 'Eviction',
                                    metadata: {
                                        name: p.name,
                                        namespace: p.namespace,
                                    },
                                },
                            });
                            r();
                        } catch (err) {
                            j(err);
                        }
                    })));
                    this.refresh();
                },
            });
        },

        isDeleteForbidden(item) {
            const labels = item.metadata.labels || [];
            const isIngressController = !!labels.find(item => item.key === 'kubernetes.io/app' && item.value === 'ingress-nginx');
            const isMaster = !!labels.find(item => item.key === 'node-role.kubernetes.io/master');
            const isSystem = !!labels.find(item => item.key === 'system/helm' && item.value === 'true');
            return isIngressController || isMaster || isSystem;
        },
        deleteItem(item) {
            this.$eConfirm({
                message: `确定删除节点 ${item.metadata.name} 吗？`,
                title: '删除',
                ok: async () => {
                    await workloadService.deleteResourceWithoutNamespace({
                        pathParams: {
                            cluster: this.instance.clusterName,
                            resource: 'nodes',
                            name: get(item, 'metadata.name'),
                        },
                    });
                    this.refresh();
                },
            });
        },
    },
};
</script>

<style module>
  .master_flag{
    display: inline-block;
    border-radius: 50%;
    background: #508ae2;
    color: #fff;
    height: 18px;
    width: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
    margin-right: 4px;
  }
  .table :global(.el-table-column--selection .cell) {
    padding: 0 14px 0 10px !important;
  }
</style>
