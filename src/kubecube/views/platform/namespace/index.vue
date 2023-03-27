<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        icon="el-icon-plus"
        type="primary"
        @click="openCreateModal"
      >
        创建空间
      </el-button>
      <el-button
        icon="el-icon-refresh-right"
        square
        @click="refresh"
      />
      <kube-pipe
        key="project"
        style="float: right;"
        graph="tenant"
        @pipestatechange="pipeLoading = $event"
      >
        <span style="line-height:32px;margin-right:12px">租户</span>
        <kubeTenantSelectMultiple v-model="tenant" style="width:300px" @syncTenant="syncTenant"/>
        <!-- <kube-tenant-select v-model="tenant" /> -->
      </kube-pipe>
    </div>
    <x-request
      v-if="!pipeLoading"
      ref="nsrequest"
      :service="subNamespaceService"
      :params="{
        params : {
          tenant: tenant && tenant.map(item => item.value).join('|'),
        }
      }"
      :processor="subNamespaceResolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="namespace"
            label="空间"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="cluster"
            label="集群"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link type="primary" :title="row.cluster" @click="openClusterInfo(row)">
                {{ row.clusterName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="tenant"
            label="租户"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="project"
            label="项目"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="resourceQuato"
            label="共享资源"
            :show-overflow-tooltip="true"
            width="75"
          >
            <template>
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
              <template v-if="row.resourceQuato">
                <div>{{ row.resourceQuato.used['requests.cpu'] | clusterCpu }} / {{row.resourceQuato.hard['requests.cpu'] | clusterCpu }} Cores</div>
                <div>{{ row.resourceQuato.used['requests.memory'] | clusterMemory }} / {{ row.resourceQuato.hard['requests.memory'] | clusterMemory }} Gi</div>
                <div>{{ row.resourceQuato.used['requests.nvidia.com/gpu'] }} / {{ row.resourceQuato.hard['requests.nvidia.com/gpu'] }} Cores</div>
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
              <template v-if="row.resourceQuato">
                <div>{{ row.resourceQuato.used['limits.cpu'] | clusterCpu }} / {{row.resourceQuato.hard['limits.cpu'] | clusterCpu }} Cores</div>
                <div>{{ row.resourceQuato.used['limits.memory'] | clusterMemory }} / {{ row.resourceQuato.hard['limits.memory'] | clusterMemory }} Gi</div>
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
            width="180"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link
                  :disabled="!row.resourceQuato && !row.nodeResourceQuato && !row.colocationResourceQuato"
                  type="primary"
                  @click="editItem(row)"
                >修改配额</el-link>
                <el-link
                  type="primary"
                  @click="editMetadata(row)"
                >修改元信息</el-link>
                <el-tooltip v-if="row.isFederateMember" class="item" effect="dark" content="此空间为联邦模式，删除管控集群的联邦空间时会一起删除该空间" placement="left">
                  <el-link
                    type="primary"
                    disabled
                  >删除</el-link>
                </el-tooltip>
                <el-link
                  v-else
                  type="primary"
                  @click="deleteItem(row)"
                >删除</el-link>
              </qz-link-group>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
    <ns-quota-dialog
      ref="nsquotadialog"
      @refresh="onRefresh"
    />
    <clusterInfoDialog
      ref="clusterInfoDialog"
    />
    <nsMetadataDialog
      ref="nsMetadataDialog"
    />
    <el-dialog
      title="删除空间"
      :visible.sync="showDelCheck"
      @close="showDelCheck = false"
    >
      <div style="margin-bottom:12px">
        删除空间"{{delNsInfo && delNsInfo.namespace}}"将会删除该空间下的所有资源！
        <div v-if="delNsInfo && delNsInfo.isFederateMaster">
          此空间为联邦模式，将会一起删除关联业务集群下的联邦空间!
        </div>
      </div>
      <div style="margin-bottom:20px">
          <el-input v-model="userInput" placeholder="请输入空间名称进行二次确认"/>
      </div>
      <div slot="footer">
        <el-button @click="showDelCheck = false">取 消</el-button>
        <el-button type="primary" @click="handleDelete" :loading="delLoading" :disabled="userInput !== delNsInfo.namespace">确认删除</el-button>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import clusterService from 'kubecube/services/cluster';
import workloadService from 'kubecube/services/k8s-resource';
import nsQuotaDialog from './ns-quota-dialog.vue';
import { unitConvertMemory, unitConvertCPU } from 'kubecube/utils/functional';
import clusterInfoDialog from './clusterInfoDialog.vue';
import kubeTenantSelectMultiple from 'kubecube/component/global/common/kube-tenant-select-multiple.vue';
import nsMetadataDialog from './ns-metadata-dialog.vue';
export default {
    metaInfo: {
        title: '空间管理 - kubecube',
    },
    components: {
        nsQuotaDialog,
        clusterInfoDialog,
        kubeTenantSelectMultiple,
        nsMetadataDialog,
    },
    filters: {
        clusterCpu(cpu) {
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
            quotaService: clusterService.getClusters,
            columns: [
                { name: 'namespace', title: '空间' },
                { name: 'cluster', title: '集群' },
                { name: 'tenant', title: '租户' },
                { name: 'project', title: '项目' },
                { name: 'resourceQuato', title: '共享资源', width: '75px' },
                { name: 'request', title: '已分配配额/请求配额', width: '140px' },
                { name: 'limit', title: '已分配上限/上限配额', width: '140px' },
                { name: 'nodeQuato', title: '独占节点（配额)' },
                { name: 'operation', title: '操作', width: '160px' },
            ],
            showDelCheck: false,
            delNsInfo: {},
            userInput: '',
            delLoading: false,
            clusterList: [],
            tenantList: [],
        };
    },
    computed: {

    },
    methods: {
        transformTenantName(tenant) {
            const target = this.tenantList.find(item => {
                return item.metadata.name === tenant;
            });
            return target && target.spec.displayName || tenant;
        },
        syncTenant(tenantList) {
            this.tenantList = tenantList;
        },
        openClusterInfo(item) {
            this.$refs.clusterInfoDialog.open(item);
        },
        async subNamespaceService(params) {
            const response = await clusterService.getSubnamespace(params);
            const quatoServerArr = [];
            response.items.forEach(namespace => {
                namespace.type = 'shared';
                quatoServerArr.push(new Promise(resolve => {
                    workloadService.getAPIV1Instance({
                        pathParams: {
                            cluster: namespace.cluster,
                            namespace: namespace.namespace,
                            resource: 'resourcequotas',
                            name: `${namespace.cluster}.${namespace.tenant}.${namespace.project}.${namespace.namespace}`,
                        },
                        noAlert: true,
                    }).then(res => {
                        resolve(res);
                    }).catch(err => {
                        resolve(null);
                    });
                }));
            });
            let resList = [];
            try {
                resList = await Promise.all(quatoServerArr);
            } catch (error) {
                console.log(error);
            }
            resList.forEach((res, index) => {
                const ns = response.items[index];
                if (ns.type === 'shared') {
                    ns.resourceQuato = res && res.status;
                }
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
        quotaResolver(data) {
            return response => {
                return data.list.map(d => {
                    const { cluster } = d;
                    const clusters = response.items || [];
                    const c = clusters.find(c => c.clusterName === cluster);
                    return {
                        ...d,
                        ...c,
                    };
                });
            };
        },
        editMetadata(item) {
            this.$refs.nsMetadataDialog.open(item);
        },
        editItem(item) {
            this.$refs.nsquotadialog.open(item);
        },
        deleteItem(item) {
            this.delLoading = false;
            this.delNsInfo = {
                type: item.type,
                namespace: item.namespace,
                cluster: item.cluster,
                project: item.project,
                isFederateMaster: item.isFederateMaster,
            };
            this.userInput = '';
            this.showDelCheck = true;
            // this.$confirm({
            //     title: '删除',
            //     content: `确认要删除 ${item.namespace} 吗？`,
            //     ok: async () => {
            //         await cubeUltimateService.deleteNameSpace({
            //             params: {
            //                 type: item.type,
            //                 namespace: item.namespace,
            //                 cluster: item.cluster,
            //                 project: item.project,
            //             },
            //         });
            //         this.refresh();
            //     },
            // });
        },
        async handleDelete() {
            this.delLoading = true;
            try {
                await workloadService.deleteAPIV1Instance({
                    pathParams: {
                        cluster: this.delNsInfo.cluster,
                        namespace: this.delNsInfo.namespace,
                        resource: 'resourcequotas',
                        name: `${this.delNsInfo.cluster}.${this.tenant.value}.${this.delNsInfo.project}.${this.delNsInfo.namespace}`,
                    },
                });
            } catch (error) {
                if (error.reason !== 'NotFound') {
                    throw error;
                }
            }
            await workloadService.deleteNamespaceCRResource({
                pathParams: {
                    cluster: this.delNsInfo.cluster,
                    group: 'hnc.x-k8s.io',
                    version: 'v1alpha2',
                    plural: 'subnamespaceanchors',
                    namespace: `kubecube-project-${this.delNsInfo.project}`,
                    name: this.delNsInfo.namespace,
                },
            });
            // await cubeUltimateService.deleteNameSpace({
            //     params: omit(this.delNsInfo, [ 'isFederateMaster' ]),
            // });
            this.delLoading = false;
            this.showDelCheck = false;
            this.refresh();
        },
        refresh() {
            this.$refs.nsrequest.request();
        },
        openCreateModal() {
            this.$refs.nsquotadialog.open();
        },
        onRefresh() {
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
