<template>
  <el-dialog
    title="集群详情"
    :visible.sync="show"
    :close-on-click-modal="false"
    width="640px"
    @close="show = false"
  >
    <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
    <el-form
      v-else
      label-position="right"
      label-width="120px"
    >
      <el-form-item label="集群名称">
        {{ instance.annotations && instance.annotations['cluster.kubecube.io/cn-name'] }}
      </el-form-item>
      <el-form-item label="集群标识">
        {{ instance.clusterName }}
      </el-form-item>
      <el-form-item label="描述">
        {{ instance.clusterDescription }}
      </el-form-item>
      <el-form-item label="状态">
        {{ instance.status | clusterStatus }}
      </el-form-item>
      <el-form-item label="创建时间">
        {{ instance.createTime | formatLocaleTime }}
      </el-form-item>
      <el-form-item label="节点数">
        {{ instance.nodeCount }}
      </el-form-item>
      <el-form-item label="CPU">
        {{ instance.totalCpu | clusterCpu }} Cores
      </el-form-item>
      <el-form-item label="内存">
        {{ instance.totalMem | clusterMemory }} GiB
      </el-form-item>
      <el-form-item label="集群用途">
        {{ instance.isMemberCluster ? '业务集群' : '管控集群' }}
      </el-form-item>
      <el-form-item label="集群网络">
        {{ instance.networkType }}
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import {
    CLUSTER_STATUS_MAP,
} from 'kubecube/utils/constance';
import { unitConvertCPU, unitConvertMemory } from 'kubecube/utils/functional';
import clusterService from 'kubecube/services/cluster';

export default {
    filters: {
        clusterStatus(status) {
            return CLUSTER_STATUS_MAP[status] || '-';
        },
        clusterCpu(cpu) {
            return unitConvertCPU(`${cpu}m`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(`${memory}Mi`, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
    },
    data() {
        return {
            regionsList: [],
            zoneList: [],
            instance: {},
            show: false,
            loading: false,
        };
    },
    methods: {
        async open(item) {
            this.show = true;
            this.loading = true;
            await this.loadClusterInfo(item.cluster);
            this.loading = false;
        },
        async loadClusterInfo(clusterName) {
            const res = await clusterService.getClusters({
                params: {
                    cluster: clusterName,
                },
            });
            this.instance = res.items[0] || {};
        },
        areaText(val, list) {
            const target = list.find(item => item.value === val);
            return target && target.text || val;
        },
    },
};
</script>

<style>

</style>