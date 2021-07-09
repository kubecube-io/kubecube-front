<template>
  <div>
    <u-button
      color="primary"
      style="margin-bottom: 20px"
      @click="viewYAML"
    >
      查看详细信息
    </u-button>
    <u-info-list-group
      title="基本信息"
      column="1"
      label-size="large"
    >
      <u-info-list-item label="集群名称">
        {{ instance.clusterName }}
      </u-info-list-item>
      <u-info-list-item label="描述">
        {{ instance.clusterDescription }}
      </u-info-list-item>
      <u-info-list-item label="状态">
        {{ instance.status | clusterStatus }}
      </u-info-list-item>
      <u-info-list-item label="创建时间">
        {{ instance.createTime | formatLocaleTime }}
      </u-info-list-item>
      <u-info-list-item label="节点数">
        {{ instance.nodeCount }}
      </u-info-list-item>
      <u-info-list-item label="CPU">
        {{ instance.totalCpu }} Cores
      </u-info-list-item>
      <u-info-list-item label="内存">
        {{ instance.totalMem }} GiB
      </u-info-list-item>
      <u-info-list-item label="集群用途">
        {{ instance.isMemberCluster ? '业务集群' : '管控集群' }}
      </u-info-list-item>
      <!-- 原生集群 || 开启了集群创建时能够设置轻舟项目权限模型，展示此信息  -->
      <!-- <u-info-list-item v-if="model.clusterMode === 'native' || showNativeClusterOption" label="轻舟项目权限模型">{{ model.clusterMode === 'native' ? '未启用' : '启用' }}</u-info-list-item> -->
      <u-info-list-item label="集群网络">
        {{ instance.networkType }}
      </u-info-list-item>
    </u-info-list-group>
  </div>
</template>

<script>
import {
    CLUSTER_STATUS_MAP,
} from 'kubecube/utils/constance';

export default {
    filters: {
        clusterStatus(status) {
            return CLUSTER_STATUS_MAP[status] || '-';
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
    }
};
</script>

<style>

</style>
