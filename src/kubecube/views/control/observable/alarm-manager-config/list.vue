<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout direction="horizontal">
      <u-button
        icon="create"
        color="primary"
        @click="toCreate"
      >
        创建告警策略组
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
          @sort="onSort"
        >
          <!-- <template #[`item.metadata.name`]="{ item }">
            <u-link :to="{path: `/control/${workload}/${item.metadata.name}`}">
              {{ item.metadata.name }}
            </u-link>
          </template> -->

          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list :key="workload">
                <!-- <u-link-list-item @click="silentItem(item)">
                  静默
                </u-link-list-item> -->
                <u-link-list-item @click="editItem(item)">
                  设置
                </u-link-list-item>
                <u-link-list-item @click="deleteItem(item)">
                  删除
                </u-link-list-item>
                <u-link-list-item @click="editYAML(item)">
                  YAML 设置
                </u-link-list-item>
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              没有搜索到相关内容，可调整关键词重新搜索
            </template>
            <template v-else>
              还没有任何 告警策略组 现在就 <u-link @click="toCreate">
                立即创建
              </u-link>
              一个吧
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
    <edit-dialog
      ref="editDialog"
      @refresh="refresh"
    />
  </u-linear-layout>
</template>

<script>
import { pickBy } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import editDialog from './edit-dialog.vue';
import {
    specCRD,
} from '../utils';

export default {
    metaInfo() {
        return {
            title: '告警策略组 - kubecube',
        };
    },
    components: {
        editDialog,
    },
    mixins: [ PageMixin ],
    data() {
        return {
            columns: [
                { title: '策略组名称', name: 'metadata.name' },
                // { title: '创建人', name: 'creater' },
                { title: '创建时间', name: 'metadata.creationTimestamp', width: '180px' },
                { title: '操作', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        namespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        service() {
            return workloadService.getNamespaceCRResource;
        },
        deleteService() {
            return workloadService.deleteNamespaceCRResource;
        },
        instanceService() {
            return workloadService.getNamespaceCRResourceInstance;
        },
        modifyService() {
            return workloadService.modifyNamespaceCRResource;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    ...specCRD,
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
            return d => d;
        },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        resolver(response) {
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
            this.pagenation.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            this.pagenation.selector = content ? `metadata.name~${content}` : undefined;
        },
        toCreate() {
            this.$refs.editDialog.open();
            // this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        view() {

        },
        // silentItem(item) {

        // },
        async editYAML(item) {
            const reqParam = {
                pathParams: {
                    ...this.requestParam.pathParams,
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
            this.$refs.editDialog.open(item);
        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            ...this.requestParam.pathParams,
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
