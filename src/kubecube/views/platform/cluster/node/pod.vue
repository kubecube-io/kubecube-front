<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout
      direction="horizontal"
      class="kube-clear"
    >
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
          <template #[`item.status.cpuUsage`]="{ item }">
            {{ item.status.cpuUsage | cpuTextFilter }}
          </template>
          <template #[`item.status.memoryUsage`]="{ item }">
            {{ item.status.memoryUsage | memoTextFilter }}
          </template>
          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list key="pods">
                <u-link-list-item @click="viewYAML(item)">
                  查看详情
                </u-link-list-item>
                <u-link-list-item @click="deleteItem(item)">
                  删除
                </u-link-list-item>
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              没有搜索到相关内容，可调整关键词重新搜索
            </template>
            <template v-else>
              还没有任何 Pod
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
  </u-linear-layout>
</template>

<script>
import { pickBy } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toPodPlainObject } from 'kubecube/k8s-resources/pod';
export default {
    metaInfo: {
        title: 'kubecube',
        titleTemplate: '%s - Pod',
    },
    mixins: [ PageMixin ],

    data() {
        return {
            service: workloadService.getResourceListWithoutNamespace,
            columns: [
                { title: '副本名称', name: 'metadata.name', sortable: true, textwrap: true },
                { title: 'IP', name: 'status.podIP', width: '80px' },
                { title: '副本状态', name: 'status.phase', width: '120px', sortable: true },
                { title: '重启次数', name: 'status.restartCount', width: '70px' },
                { title: 'CPU 使用量', name: 'status.cpuUsage', width: '100px' },
                { title: '内存使用量', name: 'status.memoryUsage', width: '100px' },
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
            this.pagenation.selector = content ? `metadata.name~${content}` : undefined;
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
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
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
