<template>
  <div>
    <kube-pipe
      key="quota-project"
      component="div"
      graph="tenant"
      @pipestatechange="pipeLoading = $event"
    >
      <span style="margin-right:8px;line-height:32px">租户</span>
      <kubeTenantSelectMultiple v-model="tenant" style="width:300px"/>
    </kube-pipe>
    <x-request
      v-if="!pipeLoading"
      ref="requestcluster"
      style="margin-top: 12px;"
      :service="clusterService()"
      :params="{
        params: {
          status: 'normal',
          nodeLabelSelector: 'node.kubecube.io/tenant=share',
          prune: true,
        },
        tenant: tenant
      }"
    >
      <template slot-scope="{ data: quota, loading: quotaLoading }">
        <el-table
          v-loading="quotaLoading"
          :data="quota || []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="clusterDisplayName"
            label="集群名称"
            :show-overflow-tooltip="true"
          />

          <el-table-column
            prop="clusterName"
            label="集群标识"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="tenantDisplayName"
            label="租户"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="cuberesourcequota"
            label="共享资源"
            :show-overflow-tooltip="true"
            width="75"
          >
            <template slot-scope="{ row }">
              <div>CPU</div>
              <div>内存</div>
              <div>GPU</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="request"
            label="已分配请求/请求配额"
            :show-overflow-tooltip="true"
            width="140"
          >
            <template slot-scope="{ row }">
              <template v-if="row.cuberesourcequota">
                <div>{{ row.cuberesourcequota.status.used.cpu }} / {{row.cuberesourcequota.status.hard.cpu }} Cores</div>
                <div>{{ row.cuberesourcequota.status.used.memory | clusterMemory }} / {{ row.cuberesourcequota.status.hard.memory | clusterMemory }} GiB</div>
                <div>{{ row.cuberesourcequota.status.used.gpu }} / {{ row.cuberesourcequota.status.hard.gpu }} Cores</div>
              </template>
              <div v-else>
                -
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="limit"
            label="已分配上限/上限配额"
            :show-overflow-tooltip="true"
            width="140"
          >
            <template slot-scope="{ row }">
              <template v-if="row.cuberesourcequota">
                <div>{{ row.cuberesourcequota.status.used.limitsCpu }} / {{ row.cuberesourcequota.status.hard.limitsCpu }} Cores</div>
                <div>{{ row.cuberesourcequota.status.used.limitsMemory | clusterMemory }} / {{ row.cuberesourcequota.status.hard.limitsMemory | clusterMemory }} GiB</div>
                <div>-</div>
              </template>
              <div v-else>
                -
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="操作"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                :disabled="row.status !== 'normal'"
                @click="editItem(row)"
              >
                调整配额
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
    <quota-dialog
      ref="quotadialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import clusterService from 'kubecube/services/cluster';
import PageMixin from 'kubecube/mixins/pagenation';
import quotaDialog from './quota-dialog.vue';
import { unitConvertMemory, unitConvertCPU } from 'kubecube/utils/functional';
import scopeService from 'kubecube/services/scope';
import { get } from 'vuex-pathify';
import {
    toPlainObject as toCubeResourceQoutaPlainObject,
} from 'kubecube/k8s-resources/cubeResourceQuota/index.js';
import kubeTenantSelectMultiple from 'kubecube/component/global/common/kube-tenant-select-multiple.vue';
import userService from 'kubecube/services/user';

export default {
    metaInfo: {
        title: '租户配额 - kubecube',
    },
    components: {
        quotaDialog,
        kubeTenantSelectMultiple,
    },
    mixins: [ PageMixin ],
    filters: {
        clusterCpu(cpu) {
            return unitConvertCPU(`${cpu}m`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(`${memory}Mi`, 'Gi')}`).toFixed(2); // Mi --> Gi
        },
    },
    data() {
        return {
            tenant: null,
            pipeLoading: true,
            tenantClusterService: clusterService.getClusterByScope,
            columns: [
                { name: 'clusterDisplayName', title: '集群名称' },
                { name: 'clusterName', title: '集群标识' },
                // { name: 'tenant', title: '租户标识' },
                { name: 'tenantDisplayName', title: '租户' },
                // { name: 'resource', title: '共享资源（已分配请求配额/已分配上限配额/请求配额/上限配额）', width: '370px' },
                { name: 'cuberesourcequota', title: '共享资源', width: '75px'},
                { name: 'request', title: '已分配配额/请求配额', width: '140px'},
                { name: 'limit', title: '已分配上限/上限配额', width: '140px'},
                // { name: 'memory', title: '持久存储（已分配/配额）' },
                { name: 'operation', title: '操作', width: '160px' },
            ],
        };
    },
    computed: {
        // params() {
        //     return {
        //         params: {
        //             namespace: getFunc(this.tenant, 'spec.namespace'),
        //         },
        //     };
        // },
        controlClusterList: get('scope/controlClusterList'),
    },
    methods: {
        clusterService() {
            return async params => {
                const response = await clusterService.getClusters({ params: params.params });
                const tenantRes = await userService.getUserTenants({});
                const list = [];
                let tenantList = getFunc(tenantRes, 'items') || [];
                if (params.tenant && params.tenant.length) {
                    console.log(params.tenant);
                    tenantList = tenantList.filter(item => params.tenant.map(item => item.value).includes(item.metadata.name));
                }
                tenantList.forEach(tenentItem => {
                    (getFunc(response, 'items') || []).forEach(clusterItem => {
                        list.push({
                            clusterDisplayName: clusterItem.annotations && clusterItem.annotations['cluster.kubecube.io/cn-name'],
                            clusterName: clusterItem.clusterName,
                            tenant: tenentItem.metadata.name,
                            tenantDisplayName: tenentItem.spec.displayName,
                            status: clusterItem.status,
                        });
                    });
                });
                const arr = list.map(item => {
                    return scopeService.getCubeQuotaResourceInstance({
                        pathParams: {
                            cluster: this.controlClusterList[0].clusterName,
                            name: `${item.clusterName}.${item.tenant}`,
                        },
                    });
                });
                const res = await Promise.all(arr);
                list.forEach((i, index) => {
                    i.cuberesourcequota = res[index] && toCubeResourceQoutaPlainObject(res[index]);
                });
                return list;
            };
        },
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
