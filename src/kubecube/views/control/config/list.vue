<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout direction="horizontal">
      <u-button
        icon="create"
        color="primary"
        @click="toCreate"
      >
        创建 {{ workloadLiteral }}
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
          <template #[`item.metadata.name`]="{ item }">
            <u-link :to="{path: `/control/${workload}/${item.metadata.name}`}">
              {{ item.metadata.name }}
            </u-link>
          </template>

          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list :key="workload">
                <u-link-list-item
                  :disabled="!SECRET_TYPES.includes(item.type)"
                  @click="editItem(item)"
                >
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
              还没有任何 {{ workloadLiteral }} 现在就 <u-link @click="toCreate">
                立即创建
              </u-link>
              一个吧
            </template>
          </template>
          <template #error>
            获取数据失败，请
            <u-link @click="refresh">
              重试
            </u-link>
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
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toConfigmapPlainObject } from 'kubecube/k8s-resources/configmap';
import { toPlainObject as toSecretPlainObject } from 'kubecube/k8s-resources/secret';
import { SECRET_TYPES } from 'kubecube/utils/constance';
export default {
    metaInfo() {
        return {
            title: `${this.workload} - kubecube`,
        };
    },
    mixins: [ PageMixin ],
    data() {
        return { SECRET_TYPES: SECRET_TYPES.map(s => s.value) };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
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
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        resolver(response) {
            console.log(response);
            const list = (response.items || []).map(this.toPlainObject);
            console.log(list);
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
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
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
