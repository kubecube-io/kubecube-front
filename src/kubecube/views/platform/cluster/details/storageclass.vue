<template>
  <div>
    <div style="margin-bottom: 12px;">
      <el-button
        type="primary"
        @click="createYAML"
      >
        YAML方式创建
      </el-button>
      <el-button
        icon="el-icon-refresh-right"
        square
        @click="refresh"
      />
      <inputSearch placeholder="请输入名称搜索" position="right" @search="onSearch"/>
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
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
            prop="pool"
            label="存储集群"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="provisioner"
            label="类型"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="reclaimPolicy"
            label="释放策略"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="operation"
            label="操作"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
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
  </div>
</template>

<script>
import { get } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import {
    toPlainObject as toStoragePlainObject,
    getDefaultModel as getStorageDefaultModel,
    toK8SObject as toStorageK8SObject,
} from 'kubecube/k8s-resources/storageclass';
import {
    CEPH_TYPE_MAP,
} from 'kubecube/utils/constance';

export default {
    filters: {
        cephTypeText(val) {
            return CEPH_TYPE_MAP[val] || val;
        },
    },
    components: {
        // createStorageclassModal,
    },
    mixins: [ PageMixin ],

    props: {
        instance: Object,
    },
    data() {
        return {
            service: workloadService.getStorage,
            selectRows: [],
            // columns: [
            //     { title: '名称', name: 'metadata.name', sortable: true },
            //     { title: '存储集群', name: 'pool' },
            //     { title: '类型', name: 'provisioner' },
            //     { title: '释放策略', name: 'reclaimPolicy' },
            //     { title: '操作', name: 'operation', width: '180px' },
            // ],
        };
    },
    computed: {
        clusterName() {
            return this.instance && this.instance.clusterName;
        },
        isControlCluster() {
            return !this.instance.isMemberCluster;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'storageclasses',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
        columns() {
            return [
                { title: '名称', name: 'metadata.name', sortable: true },
                { title: '存储集群', name: 'pool' },
                { title: '类型', name: 'provisioner' },
                { title: '释放策略', name: 'reclaimPolicy' },
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
        createYAML() {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'storageclasses',
                },
            };
            const content = toStorageK8SObject(getStorageDefaultModel());
            this.$editResource({
                title: '创建存储类别',
                content,
                onSubmit: async content => {
                    await workloadService.createStorage({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
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
                            resource: 'storageclasses',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteStorage(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
