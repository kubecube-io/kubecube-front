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
    >
      <u-info-list-item label="节点名称">
        {{ instance.metadata.name }}
      </u-info-list-item>
      <u-info-list-item label="集群名称">
        {{ clusterName }}
      </u-info-list-item>
      <u-info-list-item label="创建时间">
        {{ instance.metadata.creationTimestamp | formatLocaleTime }}
      </u-info-list-item>
      <u-info-list-item label="标签">
        <span
          v-for="label in instance.metadata.labels"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
      <u-info-list-item label="注释">
        <span
          v-for="label in instance.metadata.annotations"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
      <u-info-list-item label="污点">
        <span
          v-for="(taint, idx) in instance.spec.taints"
          :key="idx"
          class="u-chip"
          :title="`effect=${taint.effect}, ${taint.key}=${taint.value}`"
        >{{ `effect=${taint.effect}, ${taint.key}=${taint.value}` }}</span>
      </u-info-list-item>
    </u-info-list-group>
    <u-info-list-group
      title="运行环境"
      column="1"
    >
      <u-info-list-item label="内核版本">
        {{ instance.status.nodeInfo.kernelVersion }}
      </u-info-list-item>
      <u-info-list-item label="操作系统镜像">
        {{ instance.status.nodeInfo.osImage }}
      </u-info-list-item>
      <u-info-list-item label="容器运行时版本">
        {{ instance.status.nodeInfo.containerRuntimeVersion }}
      </u-info-list-item>
      <u-info-list-item label="kubelet版本">
        {{ instance.status.nodeInfo.kubeletVersion }}
      </u-info-list-item>
      <u-info-list-item label="kubeproxy版本">
        {{ instance.status.nodeInfo.kubeProxyVersion }}
      </u-info-list-item>
    </u-info-list-group>
  </div>
</template>

<script>
export default {
    props: {
        instance: Object,
    },
    computed: {
        clusterName() {
            return this.$route.params.name;
        },
    },
    methods: {
        viewYAML() {
            this.$editResource({
                title: `${this.instance.metadata.name} —— 查看 YAML`,
                content: this.instance.puresource,
                editorOption: {
                    readOnly: true,
                },
            });
        },
    },
};
</script>

<style>

</style>
