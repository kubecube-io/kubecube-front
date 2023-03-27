<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        icon="el-icon-refresh-right"
        square
        @click="refresh"
      />
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="name"
            label="组件名称"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link type="primary" :to="{ path: `/platform/monitor/${row.metadata.name}` }">
                {{ row.metadata.name }}
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
  </div>
</template>

<script>
import monitorService from 'kubecube/services/monitor';
import { get } from 'vuex-pathify';
export default {
    metaInfo: {
        title: '组件监控 - kubecube',
    },
    data() {
        return {
            service: monitorService.getInnerDashboardByQuery,
            columns: [
                { name: 'metadata.name', title: '组件名称' },
            ],
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
        params() {
            return {
                pathParams: {
                    cluster: this.controlClusterList[0].clusterName,
                },
                params: {
                    labelSelector: 'scope=component-monitoring',
                },
            };
        },
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
