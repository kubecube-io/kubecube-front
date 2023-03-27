<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        type="primary"
        @click="viewYAML"
      >
        查看详细信息
      </el-button>
    </div>
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item label="节点名称">
        {{ instance.metadata.name }}
      </el-descriptions-item>
      <el-descriptions-item label="集群名称">
        {{ clusterName }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ instance.metadata.creationTimestamp | formatLocaleTime }}
      </el-descriptions-item>
      <el-descriptions-item label="标签">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.metadata.labels" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="注释">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.metadata.annotations" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="污点">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="(taint, idx) in instance.spec.taints" :key="idx" :title="`effect=${taint.effect}, ${taint.key}=${taint.value}`">{{ `effect=${taint.effect}, ${taint.key}=${taint.value}` }}</el-tag>
        </div>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="运行环境" :column="1">
      <el-descriptions-item label="内核版本">
        {{ instance.status.nodeInfo.kernelVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="操作系统镜像">
        {{ instance.status.nodeInfo.osImage }}
      </el-descriptions-item>

      <el-descriptions-item label="容器运行时版本">
        {{ instance.status.nodeInfo.containerRuntimeVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="kubelet版本">
        {{ instance.status.nodeInfo.kubeletVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="kubeproxy版本">
        {{ instance.status.nodeInfo.kubeProxyVersion }}
      </el-descriptions-item>
    </el-descriptions>
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

<style module>
.tagWrap {
  display: flex;
  flex-wrap: wrap;
}
.tagWrap :global(.el-tag) {
  margin-right: 4px;
  margin-bottom: 4px;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 800px;
}
</style>
