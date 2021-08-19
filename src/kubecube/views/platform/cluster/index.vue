<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout direction="horizontal">
        <u-button
          icon="create"
          color="primary"
          @click="openCreateModal"
        >
          添加集群
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
      </u-linear-layout>

      <x-request
        ref="request"
        :service="service"
        :params="{}"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <kube-table
            table-width="100%"
            :loading="loading"
            :columns="columns"
            :items="data ? data.list : []"
          >
            <template #[`item.clusterName`]="{ item }">
              <u-link :to="`/platform/cluster/${item.clusterName}`">
                {{ item.clusterName }}
              </u-link>
            </template>
            <template #[`item.cpu`]="{ item }">
              {{ item.usedCpu }} / {{ item.totalCpu }}
            </template>
            <template #[`item.memory`]="{ item }">
              {{ item.usedMem }} / {{ item.totalMem }}
            </template>
            <template #[`item.status`]="{ item }">
              {{ item.status | statusFilter }}
            </template>
            <template #[`item.operation`]="{item}">
              <u-link-list>
                <!-- <u-link-list-item @click="setItem(item)">
                  设置
                </u-link-list-item> -->
                <u-link-list-item :disabled="item.clusterName === 'pivot-cluster'" @click="removeItem(item)">
                  删除配置
                </u-link-list-item>
                <!-- <u-link-list-item @click="editIngress(item)">
                  定制域名后缀
                </u-link-list-item> -->
              </u-link-list>
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
    <cluster-dialog
      ref="clusterDialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get } from 'lodash';
import PageMixin from 'kubecube/mixins/pagenation';
import clusterService from 'kubecube/services/cluster';
import clusterDialog from './dialogs/cluster.vue';
import workloadService from 'kubecube/services/k8s-resource'
// import {
//     toPlainObject
// } from 'kubecube/k8s-resources/scope/cluster';
export default {
    metaInfo: {
        title: 'tenant - kubecube',
    },
    filters: {
        statusFilter(val) {
            switch (val) {
                case 'normal':
                    return '正常';
                case 'abnormal':
                    return '不正常';
                case 'processing':
                    return '运行中';

                default:
                    return '-';
            }
        },
    },
    components: {
        clusterDialog,
    },
    mixins: [ PageMixin ],
    data() {
        return {
            service: clusterService.getClusters,
            columns: [
                { name: 'clusterName', title: '名称' },
                { name: 'clusterDescription', title: '描述' },
                { name: 'cpu', title: 'CPU (已用 / 总计)' },
                { name: 'memory', title: '内存 (已用 / 总计)' },
                { name: 'nodeCount', title: '节点' },
                { name: 'namespaceCount', title: '空间' },
                { name: 'status', title: '状态' },
                // { name: 'metadata.creationTimestamp', title: '创建时间' },
                { name: 'operation', title: '操作', width: '120px' },
            ],
        };
    },
    methods: {
        resolver(result) {
            // console.log(result);
            const r = {
                list: get(result, 'items', []),
                total: get(result, 'total', 0),
            };
            console.log(r);
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        removeItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.clusterName} 吗？`,
                ok: async () => {
                    await workloadService.deleteClusterCRResource({
                        pathParams: {
                            cluster: 'pivot-cluster',
                            group: 'cluster.kubecube.io',
                            version: 'v1',
                            plural: 'clusters',
                            name: item.clusterName,
                        },
                    });
                    this.refresh();
                },
            });
        },
        // editIngress(item) {

        // },
        // editInfo(item) {

        // },
        openCreateModal() {
            this.$refs.clusterDialog.open();
            console.log(this.$refs.user);
        },

    },
};
</script>

<style>

</style>
