<template>
  <el-row :class="$style.root">
    <el-row>
      <el-button
        type="primary"
        :disabled="isReview"
        @click="toCreate"
        icon="el-icon-plus"
      >
        创建存储声明
      </el-button>
      <el-button :disabled="!currentDelPvc || isReview" @click="deleteBatch">批量删除</el-button>
      <el-button @click="refresh" square icon="el-icon-refresh-right"></el-button>
      <inputSearch v-model="filterName" placeholder="请输入名称搜索" position="right" @search="onSearch"/>
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
            :class="$style.table"
            v-loading="loading"
            :data="data ? data.list : []"
            style="width: 100%"
            border
            @sort-change="tableSortChange"
            @selection-change="selectionChange"
            ref="multipleTable"
          >
            <el-table-column
              type="selection"
              width="38">
            </el-table-column>
            <el-table-column
              prop="metadata.name"
              label="名称"
              :show-overflow-tooltip="true"
              sortable
            >
              <template slot-scope="{ row }">
                <el-link type="primary" :to="{ path: `/control/${workload}/${row.metadata.name}`, query: $route.query }">
                  {{row.metadata.name}}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="status.phase"
              label="状态"
              :show-overflow-tooltip="true"
              width="80"
            ></el-table-column>
            <el-table-column
              prop="spec.volumeName"
              label="持久存储"
              :show-overflow-tooltip="true"
              width="120"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'spec.volumeName', '-') }}
              </template>
            </el-table-column>
            <el-table-column
              prop="spec.storageClassName"
              label="存储类别"
              :show-overflow-tooltip="true"
              width="120"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'spec.storageClassName', '-') }}
              </template>
            </el-table-column>
            <el-table-column
              prop="spec.resources.requests.storage"
              label="容量"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'spec.resources.requests.storage', '-') | memoryFilter }}
              </template>
            </el-table-column>
            <el-table-column
              prop="status.capacity.storage"
              label="实际容量"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'status.capacity.storage', '-') | memoryFilter }}
              </template>
            </el-table-column>
            <el-table-column
              prop="spec.accessModes"
              label="模式"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template slot-scope="{ row }">
                {{ row.spec.accessModes | accessModeFilter }}
              </template>
            </el-table-column>
            <el-table-column
              prop="mountBy"
              label="Mount By"
              :show-overflow-tooltip="true"
            ></el-table-column>
            <el-table-column
              prop="action"
              label="操作"
              width="180"
            >
              <template slot-scope="{ row }">
                <qz-link-group max="3">
                  <el-link type="primary" @click="editItem(row)" :disabled="isReview || row.status.phase !== 'Bound'">设置</el-link>
                  <el-link type="primary" @click="deleteItem(row)" :disabled="isReview">删除</el-link>
                  <el-link type="primary" @click="editYAML(row)" :disabled="isReview || row.status.phase !== 'Bound'">YAML 设置</el-link>
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
    </el-row>
    <create-pvc-dialog
      ref="pvc"
      @refresh="refresh"
    />
    <el-dialog
      title="删除存储声明"
      :visible.sync="showDelCheck"
      @close="handleClose"
      :close-on-click-modal="false"
    >
      <el-form
        label-width="120px"
      >
        <el-form-item label="存储声明名称">
          <div style="word-break:break-all">
              {{currentDelPvc}}
          </div>
        </el-form-item>
        <el-form-item label="文本确认">
          <el-input
            type="textarea"
            :autosize="{ minRows: 3 }"
            placeholder="请填入上方文本进行二次确认"
            v-model="userInputPvc"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleDelete" :loading="delLoading" :disabled="userInputPvc !== currentDelPvc">确 定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
import { pickBy, get as getFun } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toPVCPlainObject } from 'kubecube/k8s-resources/persistentvolumeclaim';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubecube/utils/constance';
import createPvcDialog from './create-pvc-dialog.vue';
import inputSearch from 'kubecube/elComponent/inputSearch/index.vue';
import { unitConvertMemory } from 'kubecube/utils/functional';

export default {
    metaInfo: {
        title: 'kubecube',
        titleTemplate: 'Persistentvolumeclaims - %s',
    },
    filters: {
        accessModeFilter(val) {
            return val[0] ? PVC_MODE_TEXT_MAP[val[0]] : '-';
        },
        memoryFilter(memory) {
            if (memory === '-') {
                return '-';
            }
            return Number(`${unitConvertMemory(`${memory}`, 'Gi')}`).toFixed(2) + ' GiB'; // Mi --> Gi
        },
    },
    components: {
        createPvcDialog,
        inputSearch,
    },
    mixins: [ PageMixin ],
    data() {
        return {
            getFun,
            filterName: '',
            showDelCheck: false,
            currentDelPvc: '',
            userInputPvc: '',
            delLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission['persistentvolumeclaims'];
        },
        service() {
            return workloadExtendService.getWorkloads;
        },
        instanceService() {
            return workloadService.getAPIV1Instance;

        },
        modifyService() {
            return workloadService.modifyAPIV1Instance;
        },
        deleteService() {
            return workloadService.deleteAPIV1Instance;
        },
        columns() {
            return [
                { type: 'selection', width: '60px' },
                { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                { title: '状态', name: 'status.phase', width: '80px' },
                { title: '持久存储', name: 'spec.volumeName', width: '120px' },
                { title: '存储类别', name: 'spec.storageClassName', width: '120px' },
                { title: '容量', name: 'spec.resources.requests.storage', width: '100px' },
                { title: '实际容量', name: 'status.capacity.storage' },
                { title: '模式', name: 'spec.accessModes' },
                { title: 'Mount By', name: 'mountBy' },
                { title: '操作', name: 'operation', width: '160px' },
            ];
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    // resource: this.workload,
                    resource: 'pvc',
                },
                params: {
                    ...pickBy(this.pagenation, i => !!i), // has to be this
                },
            };
        },
        workload() {
            return this.$route.params.workload;
        },
        toPlainObject() {
            return toPVCPlainObject;
        },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            const list = (response.items || []).map(this.toPlainObject);
            list.forEach(item => {
                item.mountBy = (item.puresource.pods || []).map(item => item.metadata.name).join(',');
            });
            this.$nextTick(() => {
                this.$refs.multipleTable.clearSelection();
            });
            return {
                list,
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
        toCreate() {
            this.$refs.pvc.open();
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
                    await this.modifyService({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
        editItem(item) {
            this.$refs.pvc.open(item);
            // this.$router.push({
            //     path: `/control/${this.workload}/${item.metadata.name}/edit`,
            // });
        },
        deleteItem(item) {
            this.showDelCheck = true;
            this.currentDelPvc = item.metadata.name;
            this.userInputPvc = '';
            // this.$confirm({
            //     title: '删除',
            //     content: `确认要删除 ${item.metadata.name} 吗？`,
            //     ok: async () => {
            //         const reqParam = {
            //             pathParams: {
            //                 cluster: this.cluster,
            //                 namespace: this.namespace,
            //                 resource: this.workload,
            //                 name: item.metadata.name,
            //             },
            //         };
            //         await this.deleteService(reqParam);
            //         this.$refs.request.request();
            //     },
            // });
        },
        deleteBatch() {
            this.showDelCheck = true;
            this.userInputPvc = '';
        },
        handleDelete() {
            this.delLoading = true;
            const names = this.currentDelPvc.split(',');
            const arr = [];
            names.forEach(name => {
                const reqParam = {
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: this.workload,
                        name,
                    },
                };
                arr.push(
                    this.deleteService(reqParam)
                );
            });
            Promise.all(arr).then(() => {
                setTimeout(() => {
                    this.delLoading = false;
                    this.showDelCheck = false;
                    this.$refs.request.request();
                }, 2000);
            });
        },
        selectionChange(val) {
            const names = val.map(item => {
                return item.metadata.name;
            });
            this.currentDelPvc = names.join(',');
        },
        handleClose() {
            this.showDelCheck = false;
            this.currentDelPvc = '';
            this.userInputPvc = '';
            this.$refs.request.request();
        },
    },
};
</script>

<style module>
.root :global(.el-row) + :global(.el-row) {
  margin-top: 12px;
}
.table :global(.el-table-column--selection .cell) {
  padding: 0 14px 0 10px !important;
}
</style>
