<template>
  <x-request
    ref="request"
    :service="service"
    :params="{ labelSelector: 'scope=component-monitoring' }"
    :processor="resolver"
  >
    <template slot-scope="{ data, loading, error }">
      <kube-table
        table-width="100%"
        :loading="loading"
        :columns="columns"
        :items="data || []"
        :error="error"
      >
        <template #[`item.metadata.name`]="{ item }">
          <u-link :to="{path: `/platform/monitor/${item.metadata.name}`}">
            {{ item.metadata.name }}
          </u-link>
        </template>
        <template #empty>
          暂无监控项
        </template>
        <template #error>
          获取数据失败，请<u-link @click="refresh">
            重试
          </u-link>
        </template>
      </kube-table>
    </template>
  </x-request>
</template>

<script>
import monitorService from 'kubecube/services/monitor';
export default {
    metaInfo: {
        title: '组件监控 - kubecube',
    },
    data() {
        return {
            service: monitorService.getInnerDashboardByQuery,
            columns: [
                { name: 'metadata.name', title: '组件名称' },
                // { name: 'displayName', title: '用户名' },
            ],
        };
    },
    methods: {
        resolver(response) {
            return (response.items || []);
        },
        refresh() {
            this.$refs.request.request();
        },
    },
};
</script>

<style>

</style>
