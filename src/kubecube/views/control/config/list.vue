<template>
  <div>
    <div style="margin-bottom:12px">
      <el-button
          type="primary"
          :disabled="isReview"
          @click="toCreate"
          icon="el-icon-plus"
        >
          创建 {{ workloadLiteral }}
        </el-button>
      <el-button @click="refresh" square icon="el-icon-refresh-right"></el-button>
      <inputSearch v-model="filterName" placeholder="请输入名称搜索" position="right" @search="onSearch"/>
    </div>
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
            v-if="workload === 'secrets'"
            prop="type"
            label="类型"
            :show-overflow-tooltip="true"
            width="240"
          ></el-table-column>
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
                <el-link type="primary" :disabled="!SECRET_TYPES.includes(row.type) || isReview" @click="editItem(row)">设置</el-link>
                <el-link type="primary" :disabled="isReview || (row.metadata.pureLabels || {})['system/defaultImagePullSecret'] === 'true'" @click="deleteItem(row)">删除</el-link>
                <el-link type="primary" :disabled="isReview" @click="editYAML(row)">YAML 设置</el-link>
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
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toConfigmapPlainObject } from 'kubecube/k8s-resources/configmap';
import { toPlainObject as toSecretPlainObject } from 'kubecube/k8s-resources/secret';
import { SECRET_TYPES } from 'kubecube/utils/constance';
import inputSearch from 'kubecube/elComponent/inputSearch/index.vue';
export default {
    components: {
        inputSearch,
    },
    metaInfo() {
        return {
            title: `${this.workload} - kubecube`,
        };
    },
    mixins: [ PageMixin ],
    data() {
        return {
            SECRET_TYPES: SECRET_TYPES.map(s => s.value),
            filterName: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            const keyMap = {
                configmaps: 'configmaps',
                secrets: 'secrets',
            };
            return !this.userResourcesPermission[keyMap[this.workload]];
        },
        service() {
            return workloadService.getAPIV1;
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
        workloadLiteral() {
            switch (this.workload) {
                case 'configmaps':
                    return 'Configmap';
                case 'secrets':
                    return 'Secret';
                default:
                    return '';
            }
        },
        columns() {
            switch (this.workload) {
                case 'secrets':
                    return [
                        { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: '类型', name: 'type', width: '240px' },
                        { title: '创建时间', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: '操作', name: 'operation', width: '160px' },
                    ];

                case 'configmaps':
                    return [
                        { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: '创建时间', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: '操作', name: 'operation', width: '160px' },
                    ];
                default:
                    return [];
            }

        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
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
            switch (this.workload) {
                case 'configmaps':
                    return toConfigmapPlainObject;
                case 'secrets':
                    return toSecretPlainObject;
                default:
                    return () => ({});
            }
        },
    },
    watch: {
        workload() {
            this.pagenation.selector = '';
            this.filterName = '';
        },
    },
    created() {
        this.pagenation.sortName = 'metadata.creationTimestamp';
        this.pagenation.sortOrder = 'desc';
        this.pagenation.sortFunc = 'time';
        this.pagenation.selector = '';
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            const list = (response.items || []).map(this.toPlainObject);
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
            this.pagenation.sortFunc = name === 'metadata.creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagenation.selector === temp) {
                this.refresh();
            }
            this.pagenation.selector = temp;
        },
        toCreate() {
            this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        view() {

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
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/edit`,
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
    },
};
</script>

<style>

</style>
