<template>
  <div>
    <el-button
      type="primary"
      style="margin-bottom: 20px"
      @click="viewYAML"
    >
      查看详细信息
    </el-button>
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item label="集群名称">
        {{ instance.annotations && instance.annotations['cluster.kubecube.io/cn-name'] }}
      </el-descriptions-item>
      <el-descriptions-item label="集群标识">
        {{ instance.clusterName }}
      </el-descriptions-item>
      <el-descriptions-item label="描述">
        {{ instance.clusterDescription }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        {{ instance.status | clusterStatus }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ instance.createTime | formatLocaleTime }}
      </el-descriptions-item>
      <el-descriptions-item label="节点数">
        {{ instance.nodeCount }}
      </el-descriptions-item>
      <el-descriptions-item label="CPU">
        {{ instance.totalCpu | clusterCpu }} Cores
      </el-descriptions-item>
      <el-descriptions-item label="内存">
        {{ instance.totalMem | clusterMemory }} GiB
      </el-descriptions-item>
      <el-descriptions-item label="集群用途">
        {{ instance.isMemberCluster ? '业务集群' : '管控集群' }}
      </el-descriptions-item>
      <el-descriptions-item label="集群网络">
        {{ instance.networkType }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import {
    CLUSTER_STATUS_MAP,
} from 'kubecube/utils/constance';
import { unitConvertCPU, unitConvertMemory } from 'kubecube/utils/functional';

export default {
    filters: {
        clusterStatus(status) {
            return CLUSTER_STATUS_MAP[status] || '-';
        },
        clusterCpu(cpu) {
            return Number(unitConvertCPU(`${cpu}m`)).toFixed(2); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(`${memory}Mi`, 'Gi')}`).toFixed(2); // Mi --> Gi
        },
    },
    props: {
        instance: Object,
    },
    methods: {
        viewYAML() {
            this.$editResource({
                title: `${this.instance.clusterName} —— 查看详细信息`,
                content: this.instance,
                editorOption: {
                    readOnly: true,
                },
            });
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
