<template>
  <div>
    <div
      style="margin-bottom: 12px;overflow:hidden"
    >
      <inputSearch placeholder="请输入名称搜索" position="right" @search="onSearch"/>
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
          />
          <el-table-column
            prop="status.phase"
            label="状态"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="type"
            label="类型"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.type || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="provisioner"
            label="来源"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.provisioner | cephTypeText }}
            </template>
          </el-table-column>
          <el-table-column
            prop="spec.accessModes"
            label="访问模式"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="spec.storageClassName"
            label="存储类别"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="spec.capacity.storage"
            label="容量"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.spec.capacity.storage | memoryFilter }} GiB
            </template>
          </el-table-column>
          <el-table-column
            prop="spec.claimRef.name"
            label="声明"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="operation"
            label="操作"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link
                  type="primary"
                  @click="viewYAML(row)"
                >查看详情</el-link>
                <el-link
                  type="primary"
                  @click="deleteItem(row)"
                >删除</el-link>
              </qz-link-group>
            </template>
          </el-table-column>
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
    <taint-dialog
      ref="taintdialog"
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
    toPlainObject as toStoragePlainObject,
} from 'kubecube/k8s-resources/persistentvolumes';
import taintDialog from '../dialogs/taint.vue';
import {
    CEPH_TYPE_MAP,
} from 'kubecube/utils/constance';
import inputSearch from 'kubecube/elComponent/inputSearch/index.vue';
import { unitConvertMemory } from 'kubecube/utils/functional';

export default {
    filters: {
        cephTypeText(val) {
            return CEPH_TYPE_MAP[val] || val || '-';
        },
        memoryFilter(memory) {
            return Number(`${unitConvertMemory(`${memory}`, 'Gi')}`).toFixed(2); // Mi --> Gi
        },

    },
    components: {
        taintDialog,
        inputSearch,
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
                { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                { title: '状态', name: 'status.phase' },
                { title: '类型', name: 'type' },
                { title: '来源', name: 'provisioner' },
                { title: '访问模式', name: 'spec.accessModes' },
                { title: '存储类别', name: 'spec.storageClassName' },
                { title: '容量', name: 'spec.capacity.storage' },
                { title: '声明', name: 'spec.claimRef.name', textwrap: true },
                { title: '操作', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'persistentvolumes',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            return {
                list: (response.items || []).map(toStoragePlainObject),
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
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagenation.selector === temp) {
                this.refresh();
            }
            this.pagenation.selector = temp;
        },
        cephCluster(item) {
            return get(item, 'metadata.annotations["ceph-cluster-name"]')
            || get(item, 'metadata.annotations["cephfs-cluster-name"]');
        },
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'persistentvolumes',
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getResourceWithoutNamespace(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— 查看 YAML`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        deleteItem(item) {
            this.$eConfirm({
                title: '删除',
                message: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.instance.clusterName,
                            resource: 'persistentvolumes',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteResourceWithoutNamespace(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
