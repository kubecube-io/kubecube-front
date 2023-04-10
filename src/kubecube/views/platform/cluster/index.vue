<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="openCreateModal"
      >
        添加集群
      </el-button>
      <el-button
        square
        icon="el-icon-refresh-right"
        @click="refresh"
      />
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <el-table
          v-loading="loading"
          :data="data ? data.list : []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="clusterDisplayName"
            label="集群名称"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                :to="{ path: `/platform/cluster/${row.clusterName}` }"
                type="primary"
                :title="row.annotations && row.annotations['cluster.kubecube.io/cn-name']"
              >
                {{ row.annotations && row.annotations['cluster.kubecube.io/cn-name'] }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="clusterName"
            label="集群标识"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="clusterDescription"
            label="描述"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.clusterDescription || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="isMemberCluster"
            label="集群用途"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.isMemberCluster ? '业务集群' : '管控集群' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="cpu"
            label="CPU (已用 / 总计)"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              {{ row.usedCpu | clusterCpu }} / {{ row.totalCpu | clusterCpu }} Cores
            </template>
          </el-table-column>
          <el-table-column
            prop="memory"
            label="内存 (已用 / 总计)"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              {{ row.usedMem | clusterMemory }} / {{ row.totalMem | clusterMemory }} Gi
            </template>
          </el-table-column>
          <el-table-column
            prop="nodeCount"
            label="节点"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="namespaceCount"
            label="空间"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="status"
            label="状态"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.status | statusFilter }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="操作"
            :show-overflow-tooltip="true"
            width="160"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="2">
                <el-link
                  type="primary"
                  @click="setItem(row)"
                >
                  修改集群
                </el-link>
                <el-link
                  type="primary"
                  :disabled="row.clusterName === controlClusterList[0].clusterName || row.status === 'deleting' || row.status === 'processing'"
                  @click="removeItem(row)"
                >
                  删除配置
                </el-link>
                <el-link
                  type="primary"
                  @click="editDomainSuffix(row)"
                >
                  定制域名后缀
                </el-link>
              </qz-link-group>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="data && calculatePages(data.total) > 0"
          style="float:right;margin-top:12px"
          :current-page="pagenation.pageNum"
          :page-sizes="[100]"
          :page-size="pagenation.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="data.total"
          background
          @size-change="pageSizeChange"
          @current-change="pageNumChange"
        />
      </template>
    </x-request>
    <cluster-dialog
      ref="clusterDialog"
      @refresh="refresh"
    />
    <domainSuffixDialog
      ref="domainSuffixDialog"
      @refresh="refresh"
    />
    <el-dialog
      title="删除集群"
      :visible.sync="showDelete"
      width="700px"
      :close-on-click-modal="false"
    >
      <div
        :class="$style.noticeWrap"
      >
        <span :class="$style.textspan">
          请参照
        </span>
        <el-link
          type="primary"
          target="_blank"
          href="https://www.kubecube.io/docs/installation-guide/install-on-k8s/install-member-by-helm/#卸载计算集群中的-warden"
        >
          文档链接
        </el-link>
        <span :class="$style.textspan">
          来移除已纳管的计算集群。
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { get as getFun } from 'lodash';
import clusterService from 'kubecube/services/cluster';
import clusterDialog from './dialogs/cluster.vue';
import workloadService from 'kubecube/services/k8s-resource';
import domainSuffixDialog from './dialogs/domainSuffix.vue';
import { unitConvertMemory, unitConvertCPU } from 'kubecube/utils/functional';
import { get } from 'vuex-pathify';
import { pagenationMixin } from 'kubecube/mixins';
// import {
//     toPlainObject
// } from 'kubecube/k8s-resources/scope/cluster';
export default {
    metaInfo: {
        title: '集群管理 - kubecube',
    },
    filters: {
        clusterCpu(cpu) {
            return unitConvertCPU(`${cpu}m`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(`${memory}Mi`, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
        statusFilter(val) {
            switch (val) {
                case 'normal':
                    return '正常';
                case 'abnormal':
                    return '不正常';
                case 'processing':
                    return '运行中';
                case 'deleting':
                    return '删除中';
                default:
                    return '-';
            }
        },
    },
    components: {
        clusterDialog,
        domainSuffixDialog,
    },
    mixins: [ pagenationMixin ],
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
                { name: 'operation', title: '操作', width: '160px' },
            ],
            showDelete: false,
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
        requestParam() {
            return {
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
        resolver(result) {
            // console.log(result);
            const r = {
                list: getFun(result, 'items', []),
                total: getFun(result, 'total', 0),
            };
            console.log(r);
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        removeItem() {
            this.showDelete = true;
        },
        editDomainSuffix(item) {
            this.$refs.domainSuffixDialog.open(item);
        },
        // editInfo(item) {

        // },
        openCreateModal() {
            this.$refs.clusterDialog.open();
        },
        setItem(item) {
            this.$refs.clusterDialog.open(item);
        },
    },
};
</script>

<style module>
.noticeWrap {
  display: flex;
  align-items: center;
}
.noticeWrap .textspan {
  flex-shrink: 0;
}
</style>
