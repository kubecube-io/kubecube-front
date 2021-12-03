<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout
        direction="horizontal"
        class="kube-clear"
      >
        <u-button
          icon="create"
          color="primary"
          @click="openCreateModal"
        >
          创建空间
        </u-button>

        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
        <kube-pipe
          key="project"
          style="float: right;"
          component="u-linear-layout"
          graph="tenant"
          direction="horizontal"
          @pipestatechange="pipeLoading = $event"
        >
          <u-text>租户</u-text>
          <kube-tenant-select v-model="tenant" />
        </kube-pipe>
      </u-linear-layout>

      <x-request
        v-if="!pipeLoading"
        ref="nsrequest"
        :service="subNamespaceService"
        :params="{
          params : {
            tenant: tenant && tenant.value
          }
        }"
        :processor="subNamespaceResolver"
      >
        <template slot-scope="{ data, loading, error }">
          <u-loading v-if="loading" />
          <kube-table
            v-else
            :class="$style.table"
            table-width="100%"
            :loading="loading"
            :columns="columns"
            :items="data || []"
            :error="error"
          >
            <template #[`item.resourceQuato`]="{ item }">
              <template v-if="item.resourceQuato">
                <p>CPU: {{ item.resourceQuato.used['requests.cpu'] | clusterCup }} / {{item.resourceQuato.hard['requests.cpu'] | clusterCup }} Cores</p>
                <p>内存: {{ item.resourceQuato.used['requests.memory'] | clusterMemory }} / {{ item.resourceQuato.hard['requests.memory'] | clusterMemory }} Gi</p>
                <p>GPU: {{ item.resourceQuato.used['requests.nvidia.com/gpu'] }} / {{ item.resourceQuato.hard['requests.nvidia.com/gpu'] }} Cores</p>
              </template>
              <div v-else>
                -
              </div>
            </template>
            <template #[`item.memory`]="{ item }">
              <p>{{ formatQuota(item.usedStorage, item.totalStorage) }}</p>
            </template>
            <template #[`item.operation`]="{item}">
              <u-link-list>
                <u-link-list-item @click="editItem(item)">
                  修改
                </u-link-list-item>
                <u-link-list-item @click="deleteItem(item)">
                  删除
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #noData>
              还没有任何 空间, 现在就
              <u-link @click="openCreateModal">
                立即创建
              </u-link>
              一个吧。
            </template>
            <template #error>
              获取数据失败，请<u-link @click="refresh">
                重试
              </u-link>
            </template>
          </kube-table>
        </template>
      </x-request>
    </u-linear-layout>
    <ns-quota-dialog
      ref="nsquotadialog"
      :tenant="tenant"
      @refresh="onRefresh"
    />
  </div>
</template>

<script>
import { uniq } from 'lodash';
import clusterService from 'kubecube/services/cluster';
import workloadService from 'kubecube/services/k8s-resource';
import kubeTenantSelect from 'kubecube/component/global/common/kube-tenant-select.vue';
import nsQuotaDialog from './ns-quota-dialog.vue';
import { unitConvertMemory, unitConvertCPU } from 'kubecube/utils/functional';

export default {
    metaInfo: {
        title: '空间管理 - kubecube',
    },
    components: {
        kubeTenantSelect,
        nsQuotaDialog,
    },
    filters: {
        clusterCup(cpu) {
            return unitConvertCPU(`${cpu}`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(memory, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
    },
    data() {
        return {
            tenant: null,
            pipeLoading: true,
            columns: [
                { name: 'namespace', title: '空间' },
                { name: 'cluster', title: '集群' },
                { name: 'project', title: '项目' },
                { name: 'resourceQuato', title: '共享资源（已分配/配额）' },
                // { name: 'memory', title: '持久存储（已分配/配额）' },
                { name: 'operation', title: '操作', width: '160px' },
            ],
        };
    },
    computed: {

    },
    methods: {
        async subNamespaceService(params) {
            const response = await clusterService.getSubnamespace(params);
            const quatoServerArr = [];
            response.items.forEach(namespace => {
                quatoServerArr.push(workloadService.getAPIV1Instance({
                    pathParams: {
                        cluster: namespace.cluster,
                        namespace: namespace.namespace,
                        resource: 'resourcequotas',
                        name: `${namespace.cluster}.${params.params.tenant}.${namespace.project}.${namespace.namespace}`,
                    },
                }).then(result => result).catch(() => null));
            });
            const resList = await Promise.all(quatoServerArr);
            resList.forEach((res, index) => {
                const ns = response.items[index];
                ns.resourceQuato = res && res.status;
            });
            return response;
        },
        normalizeCore(d) {
            return d / 1000;
        },
        formatQuota(used, capacity, normalize = d => d) {
            return `${normalize(used)}/${normalize(capacity)}`;
        },
        subNamespaceResolver(response) {
            return response.items;
        },
        editItem(item) {
            this.$refs.nsquotadialog.open(item);
        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.namespace} 吗？`,
                ok: async () => {
                    try {
                        await workloadService.deleteAPIV1Instance({
                            pathParams: {
                                cluster: item.cluster,
                                namespace: item.namespace,
                                resource: 'resourcequotas',
                                name: `${item.cluster}.${this.tenant.value}.${item.project}.${item.namespace}`,
                            },
                        });
                    } catch (error) {
                        if (error.reason !== 'NotFound') {
                            throw error;
                        }
                    }
                    await workloadService.deleteNamespaceCRResource({
                        pathParams: {
                            cluster: item.cluster,
                            group: 'hnc.x-k8s.io',
                            version: 'v1alpha2',
                            plural: 'subnamespaceanchors',
                            namespace: `kubecube-project-${item.project}`,
                            name: item.namespace,
                        },
                    });
                    this.refresh();
                },
            });
        },
        // resolver(result) {
        //     console.log(result, getFunc(result, 'items', []));
        //     const r = {
        //         list: (getFunc(result, 'items') || []).map(i => toPlainObject(i)),
        //         total: getFunc(result, 'total', 0),
        //     };
        //     console.log(r);
        //     return r;
        // },
        refresh() {
            this.$refs.nsrequest.request();
        },

        openCreateModal() {
            this.$refs.nsquotadialog.open();
        },

        onRefresh(tenant) {
            this.tenant = { value: tenant };
            this.refresh();
        },

    },

};
</script>

<style module>
.table p {
    line-height: 1.5em;
    margin: 0;
}
</style>
