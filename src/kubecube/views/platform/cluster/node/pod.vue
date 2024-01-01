<template>
  <div>
    <div style="margin-bottom:12px;overflow:hidden">
      <inputSearch placeholder="请输入名称搜索" position="right" @search="onSearch"/>
     </div>
    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
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
            label="副本名称"
            :show-overflow-tooltip="true"
            sortable
          >
          </el-table-column>
          <el-table-column
            prop="status.podIP"
            label="IP"
            :show-overflow-tooltip="true"
            width="100"
          >
          </el-table-column>
          <el-table-column
            prop="status.phase"
            label="副本状态"
            :show-overflow-tooltip="true"
            sortable
            width="120"
          >
          </el-table-column>
          <el-table-column
            prop="status.restartCount"
            label="重启次数"
            :show-overflow-tooltip="true"
            width="70"
          >
          </el-table-column>
          <el-table-column
            prop="status.cpuUsage"
            label="CPU 请求使用量"
            :show-overflow-tooltip="true"
            width="110"
          >
            <template slot-scope="{ row }">
              {{ row.status.cpuUsage && row.status.cpuUsage.toFixed(2) }} Cores
            </template>
          </el-table-column>
          <el-table-column
            prop="status.memoryUsage"
            label="内存请求使用量"
            :show-overflow-tooltip="true"
            width="110"
          >
            <template slot-scope="{ row }">
              {{ row.status.memoryUsage && row.status.memoryUsage.toFixed(2)  }} Mi
            </template>
          </el-table-column>
          <el-table-column
            prop="metadata.namespace"
            label="空间"
            :show-overflow-tooltip="true"
            width="100"
          >
          </el-table-column>
          <el-table-column
            prop="metadata.creationTimestamp"
            label="创建时间"
            :show-overflow-tooltip="true"
            width="160"
            sortable
          >
            <template slot-scope="{ row }">
              {{ row.metadata.creationTimestamp | formatLocaleTime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="操作"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link type="primary" @click="viewYAML(row)">查看详情</el-link>
                <el-link type="primary" @click="deleteItem(row)">删除</el-link>
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
  </div>
</template>

<script>
import { pickBy } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toPodPlainObject } from 'kubecube/k8s-resources/pod';
import inputSearch from 'kubecube/elComponent/inputSearch/index.vue';
export default {
    metaInfo: {
        title: 'kubecube',
        titleTemplate: '%s - Pod',
    },
    mixins: [ PageMixin ],
    components: {
        inputSearch,
    },
    data() {
        return {
            service: workloadService.getResourceListWithoutNamespace,
            columns: [
                { title: '副本名称', name: 'metadata.name', sortable: true, textwrap: true },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: '副本状态', name: 'status.phase', width: '120px', sortable: true },
                { title: '重启次数', name: 'status.restartCount', width: '70px' },
                { title: 'CPU 使用量', name: 'status.cpuUsage', width: '100px' },
                { title: '内存使用量', name: 'status.memoryUsage', width: '100px' },
                { title: '空间', name: 'metadata.namespace', width: '100px' },
                { title: '创建时间', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                { title: '操作', name: 'operation', width: '120px' },
            ],
        };
    },
    computed: {
        cluster() {
            return this.$route.params.name;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    resource: 'pods',
                },
                params: {
                    ...pickBy(this.pagenation, i => !!i), // has to be this
                    fieldSelector: `spec.nodeName=${this.$route.params.nodename}`,
                },
            };
        },
    },

    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            const list = (response.items || []).map(toPodPlainObject);
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
            let temp = content ? `metadata.name~${content}` : undefined;
            if(this.pagenation.selector === temp) {
                this.refresh()
            }
            this.pagenation.selector = temp;
        },
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: item.metadata.namespace,
                    resource: 'pods',
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getAPIV1Instance(reqParam);

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
                            cluster: this.cluster,
                            namespace: item.metadata.namespace,
                            resource: 'pods',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteAPIV1Instance(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
