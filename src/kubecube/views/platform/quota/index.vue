<template>
  <div>
    <kube-pipe
      key="quota-project"
      component="u-linear-layout"
      graph="tenant"
      direction="horizontal"
      @pipestatechange="pipeLoading = $event"
    >
      <u-text>租户</u-text>
      <kube-tenant-select v-model="tenant" />
    </kube-pipe>
    <x-request
      v-if="!pipeLoading"
      ref="request"
      style="margin-top: 20px;"
      :service="tenantClusterService"
      :params="params"
      :processor="tenantClusterResolver"
    >
      <template slot-scope="{ data, loading }">
        <u-loading v-if="loading" />
        <template v-else>
          <x-request
            ref="requestcluster"
            :service="clusterService"
            :params="{}"
            :processor="quotaResolver(data)"
          >
            <template slot-scope="{ data: quota, loading: quotaLoading, error }">
              <kube-table
                :class="$style.table"
                table-width="100%"
                :loading="quotaLoading"
                :columns="columns"
                :items="quota || []"
                :error="error"
              >
                <template #[`item.resource`]="{ item }">
                  <p>CPU: {{ formatQuota(item.usedCpu, item.totalCpu, normalizeCore) }} Cores</p>
                  <p>内存: {{ formatQuota(item.usedMem, item.totalMem) }} Mi</p>
                  <p>GPU: {{ formatQuota(item.usedGpu, item.totalGpu) }} Cores</p>
                </template>
                <template #[`item.memory`]="{ item }">
                  <p>{{ formatQuota(item.usedStorage, item.totalStorage) }}</p>
                </template>
                <template #[`item.operation`]="{ item }">
                  <u-linear-layout gap="small">
                    <u-link-list>
                      <u-link-list-item @click="editItem(item)">
                        调整配额
                      </u-link-list-item>
                    </u-link-list>
                  </u-linear-layout>
                </template>
                <template #noData>
                  未选择租户
                </template>
              </kube-table>
            </template>
          </x-request>
        </template>
      </template>
    </x-request>
    <quota-dialog
      ref="quotadialog"
      :tenant="tenant"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import clusterService from 'kubecube/services/cluster';
import PageMixin from 'kubecube/mixins/pagenation';
import kubeTenantSelect from 'kubecube/component/global/common/kube-tenant-select.vue';
import quotaDialog from './quota-dialog.vue';

export default {
    metaInfo: {
        title: 'quota - kubecube',
    },
    components: {
        kubeTenantSelect,
        quotaDialog,
    },
    mixins: [ PageMixin ],
    data() {
        return {
            tenant: null,
            pipeLoading: true,
            tenantClusterService: clusterService.getClusterByScope,
            clusterService: clusterService.getClusters,
            columns: [
                { name: 'clusterName', title: '集群' },
                { name: 'resource', title: '共享资源' },
                // { name: 'memory', title: '持久存储（已分配/配额）' },
                { name: 'operation', title: '操作', width: '160px' },
            ],
        };
    },
    computed: {
        params() {
            return {
                params: {
                    namespace: getFunc(this.tenant, 'spec.namespace'),
                },
            };
        },
    },
    methods: {
        refresh() {
            this.$refs.requestcluster.request();
        },
        tenantClusterResolver(response) {
            return getFunc(response, 'items', []);
        },
        normalizeCore(d) {
            return d / 1000;
        },
        formatQuota(used, capacity, normalize = d => d) {
            return `${normalize(used)}/${normalize(capacity)}`;
        },
        quotaResolver(data) {
            return response => {
                if (!this.tenant) return [];
                const items = getFunc(response, 'items', []);
                return items.filter(i => data.includes(i.clusterName));
            };
        },
        editItem(item) {
            this.$refs.quotadialog.open(item);
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
