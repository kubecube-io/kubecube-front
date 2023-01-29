<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout direction="horizontal">
      <u-button
        icon="create"
        color="primary"
        @click="toCreate"
      >
        创建{{ workloadLiteral }}
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
          <template #[`item.spec.rules`]="{ item }">
            {{ ingressRuleFilter(item) }}
          </template>

          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list :key="workload">
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
              还没有任何 {{ workloadLiteral }} 现在就 <u-link @click="toCreate">
                立即创建
              </u-link>
              一个吧
            </template>
          </template>
          <template #error>
            获取数据失败，请<u-link @click="refresh">
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
import { pickBy, get as getFun } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toServicePlainObject } from 'kubecube/k8s-resources/service';
import { toPlainObject as toIngressPlainObject } from 'kubecube/k8s-resources/ingress';
export default {
    metaInfo() {
        return {
            title: `${this.workload} - kubecube`,
        };
    },
    mixins: [ PageMixin ],
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        service() {
            switch (this.workload) {
                case 'services':
                    return workloadExtendService.getWorkloads;
                case 'ingresses':
                    return workloadService.getNetworking;
                default:
                    return null;
            }
        },
        instanceService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.getAPIV1Instance;
                case 'ingresses':
                    return workloadService.getNetworkingInstance;
                default:
                    return null;
            }
        },
        modifyService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.modifyAPIV1Instance;
                case 'ingresses':
                    return workloadService.modifyNetworkingInstance;
                default:
                    return null;
            }
        },
        deleteService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.deleteAPIV1Instance;
                case 'ingresses':
                    return workloadService.deleteNetworkingInstance;
                default:
                    return null;
            }
        },
        workloadLiteral() {
            switch (this.workload) {
                case 'services':
                    return '服务';
                case 'ingresses':
                    return '负载均衡';
                default:
                    return '';
            }
        },
        columns() {
            switch (this.workload) {
                case 'services':
                    return [
                        { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: '类型', name: 'spec.type', width: '80px' },
                        { title: '内部访问地址', name: 'spec.ports', width: '120px', type: 'tag' },
                        { title: '外部访问地址', name: 'outside', width: '120px' },
                        { title: '集群 IP', name: 'spec.clusterIP', width: '100px' },
                        { title: '创建时间', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: '操作', name: 'operation', width: '160px' },
                    ];

                case 'ingresses':
                    return [
                        { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: '外部访问地址', name: 'outside', width: '120px' },
                        { title: '规则', name: 'spec.rules', width: '200px' },
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
                case 'services':
                    return toServicePlainObject;
                case 'ingresses':
                    return toIngressPlainObject;
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
        ingressRuleFilter(item) {
            const strArr = []
            const rules = getFun(item, 'spec.rules', []);
            rules.forEach(rule => {
                const host = getFun(rule, 'host');
                const paths =  getFun(rule, 'http.paths', []);
                paths.forEach(path => {
                    let target = `${getFun(path, 'backend.service.name', '')}:${getFun(path, 'backend.service.port.number', '')}`
                    let source = `${host}${getFun(path, 'path', '')}`;
                    strArr.push(`${source}->${target}`);
                })
            })
            return strArr.join(', ')
        },
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
