<template>
  <div>
    <template v-if="isInSubPath">
      <router-view />
    </template>
    <template v-else>
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
            @click="toCreate"
          >
            创建网络策略
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
            :items="data ? data.list : []"
            :error="error"
            @sort="onSort"
          >
            <template #[`item.operation`]="{item}">
              <u-link-list>
                <u-link-list-item
                  @click="viewYAML(item)"
                >
                  查看详情
                </u-link-list-item>
                <u-link-list-item
                  @click="toEdit(item)"
                >
                  设置
                </u-link-list-item>
                <u-link-list-item
                  @click="deleteItem(item)"
                >
                  删除
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #noData>
              还没有任何 网络策略, 现在就
              <u-link @click="toCreate">
                立即创建
              </u-link>
              一个吧。
            </template>
          </kube-table>
        </template>
      </x-request>
    </template>
  </div>
</template>

<script>
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toNetworPolicyPlainObject,
} from 'kubecube/k8s-resources/networkPolicy';
import PageMixin from 'kubecube/mixins/pagenation';

export default {
    mixins: [ PageMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            service: workloadService.getClusterNetworking,
            selectRows: [],
            columns: [
                { title: '名称', name: 'metadata.name', sortable: true },
                { title: '空间', name: 'metadata.namespace', width: '200px' },
                { title: '操作', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        isInSubPath() {
            return !this.$route.path.endsWith('network');
        },
        isControlCluster() {
            return !this.instance.isMemberCluster;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'networkpolicies',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
        toCreate() {
            this.$router.push({ path: `/platform/cluster/${this.instance.clusterName}/network/create` });
        },
        toEdit(item) {
            this.$router.push({ path: `/platform/cluster/${this.instance.clusterName}/network/edit/${item.metadata.namespace}/${item.metadata.name}` });
        },
        resolver(response) {
            return {
                list: response.items.map(toNetworPolicyPlainObject),
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
                    cluster: this.instance.clusterName,
                    resource: 'networkpolicies',
                    namespace: item.metadata.namespace,
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getNetworkingInstance(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— 查看 YAML`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        deleteItem(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'networkpolicies',
                    namespace: item.metadata.namespace,
                    name: item.metadata.name,
                },
            };
            this.$confirm({
                content: `确定删除网络策略 ${item.metadata.name} 吗？`,
                title: '删除',
                ok: async () => {
                    await workloadService.deleteNetworkingInstance(reqParam);
                    this.refresh();
                },
            });
        },
    },
};
</script>

<style>

</style>
