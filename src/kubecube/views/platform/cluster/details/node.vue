<template>
  <div>
    <u-linear-layout
      style="margin-bottom: 20px;"
      direction="horizontal"
    >
      <u-linear-layout
        direction="horizontal"
        class="kube-clear"
      >
        <u-button
          icon="create"
          color="primary"
          @click="$refs.nodedialog.open()"
        >
          添加节点
        </u-button>
        <!-- <u-button @click="exportNode">
          导出节点信息
        </u-button> -->
        <u-button
          v-if="selectRows.length"
          @click="showNodeTypeModal = true"
        >
          设置节点类型
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

      <!-- <search-tag :class="$style.search" :tagTypes="tagTypes" @search="searchNodes" :limit="10"></search-tag> -->
    </u-linear-layout>
    <x-request
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          item-key="metadata.name"
          :items="data ? data.list : []"
          :error="error"
          @sort="onSort"
          @selection:change="onSelectionChange"
        >
          <template #[`item.metadata.name`]="{ item }">
            <u-tooltip v-if="item.metadata.labels.find(i => i.key === 'node-role.kubernetes.io/master')" content="master 节点" trigger="hover" placement="top">
              <span :class="$style.master_flag">控</span>
            </u-tooltip>
            <u-link :to="`/platform/cluster/${instance.clusterName}/${item.metadata.name}`">
              {{ item.metadata.name }}
            </u-link>
          </template>
          <template #[`item.status.capacity.cpu`]="{ item }">
            {{ item.status.capacity.cpu | cpuTextFilter }}
          </template>
          <template #[`item.status.memoryUsage`]="{ item }">
            {{ item.status.capacity.memory | memoTextFilter }}
          </template>
          <template #[`item.spec.unschedulable`]="{ item }">
            {{ item.spec.unschedulable ? '不可调度' : '可调度' }}
          </template>
          <template #[`item.operation`]="{item}">
            <u-link-list>
              <u-link-list-item
                @click="openLabelsModal(item)"
              >
                编辑标签
              </u-link-list-item>
              <u-link-list-item
                @click="schedule(item)"
              >
                {{ !item.spec.unschedulable ? '禁止' : '允许' }}调度
              </u-link-list-item>
              <!-- <u-link-list-item
                :disabled="item.spec.type !== '-'"
                @click="openTypeModal(item)"
              >
                设置节点类型
              </u-link-list-item> -->
              <!-- <u-link-list-item @click="toggleMix(item)">
                {{ item.colocation ? '取消混部' : '设置为混部' }}
              </u-link-list-item> -->
              <u-link-list-item @click="setTaints(item)">
                设置污点
              </u-link-list-item>
              <u-link-list-item
                :disabled="(data.list || []).length < 2"
                @click="drainItem(item)"
              >
                平滑迁移
              </u-link-list-item>
              <u-link-list-item
                :disabled="isDeleteForbidden(item)"
                @click="deleteItem(item)"
              >
                删除
              </u-link-list-item>
            </u-link-list>
          </template>
        </kube-table>
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

export default {
    components: {
        taintDialog,
        nodeDialog,
        labelDialog,
    },
    mixins: [ PageMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            service: workloadService.getResourceListWithoutNamespace,
            selectRows: [],
            columns: [
                { type: 'selection', width: '60px' },
                { title: '名称', name: 'metadata.name', sortable: true },
                { title: 'IP', name: 'status.nodeIP', width: '120px', sortable: true },
                { title: 'CPU', name: 'status.capacity.cpu', width: '80px' },
                { title: '内存', name: 'status.capacity.memory', width: '80px' },
                { title: 'GPU', name: 'status.capacity["nvidia.com/gpu"]', width: '60px' },
                { title: '标签', name: 'metadata.labels', type: 'tag', width: '180px', cellprops: { hasModal: true, isChip: true, formatter } },
                { title: '节点类型', name: 'spec.type', width: '60px' },
                { title: '可调度', name: 'spec.unschedulable', width: '60px' },
                { title: '状态', name: 'status.statusText', width: '60px' },
                { title: '操作', name: 'operation', width: '180px' },
            ],
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
    },
    methods: {
        async exportNode() {
            // await fetch(`/ncs/proxy/api/v1/ncs/extends/clusters/${this.clusterId}/nodes/export`, {
            //     method: 'GET',
            // }).then(response => response.blob())
            //     .then(blob => {
            //         const url = window.URL.createObjectURL(blob);
            //         const a = document.createElement('a');
            //         a.href = url;
            //         a.download = 'nodes.csv';
            //         document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            //         a.click();
            //         a.remove(); // afterwards we remove the element again
            //     });
        },
        resolver(response) {
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
        onSearch(content) {
            this.pagenation.selector = content ? `metadata.name~${content}` : undefined;
        },
        onSelectionChange($event) {
            this.selectRows = $event;
        },
        openLabelsModal(item) {
            this.$refs.labelDialog.open(item);
        },
        schedule(item) {
            if (!item.spec.unschedulable) {
                this.$confirm({
                    content: '确定禁止工作负载调度到该节点吗？',
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
        openTypeModal() {},
        toggleMix() {},
        setTaints(item) {
            this.$refs.taintdialog.open(item);
        },
        drainItem(item) {
            this.$confirm({
                content: `确定迁移节点 ${item.metadata.name} 吗？`,
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
                    const pod = pods.items.map(toMetadataPlainObject).filter(i => ![ 'kube-public', 'kube-system' ].includes(i.metadata.namespace)
                        && i.metadata.ownerReferences !== 'daemonset');

                    await Promise.all(pod.map(p => new Promise(async (r, j) => {
                        try {
                            await workloadService.eviction({
                                pathParams: {
                                    cluster: this.instance.clusterName,
                                    namespace: p.metadata.namespace,
                                    name: p.metadata.name,
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
            this.$confirm({
                content: `确定删除节点 ${item.metadata.name} 吗？`,
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
  }
</style>
