<template>
  <div>
    <u-info-list-group
      title="基本信息"
      column="1"
      label-size="large"
    >
      <u-info-list-item label="日志任务名称">
        {{ instance.metadata.name }}
      </u-info-list-item>
      <u-info-list-item label="日志源类型">
        {{ instance.type | logType }}
      </u-info-list-item>
      <u-info-list-item label="集群名称">
        {{ cluster }}
      </u-info-list-item>
      <u-info-list-item label="空间">
        {{ namespace }}
      </u-info-list-item>
      <u-info-list-item label="创建时间">
        {{ instance.metadata.creationTimestamp | smartDateFormat }}
      </u-info-list-item>
      <u-info-list-item label="标签选择器">
        <span
          v-for="label in instance.metadata.labels"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
    </u-info-list-group>
    <u-info-list-group
      v-if="instance.inputs.length > 0"
      title="高级配置"
      column="1"
      label-size="large"
    >
      <kube-list-block
        v-for="(input, idx) in instance.inputs"
        :key="idx"
      >
        <template slot="breif">
          日志采集路径: {{ input.paths.map(p => p.path).join(', ') }}
        </template>
        <u-info-list-item
          v-if="input.paths.length"
          label="日志采集路径"
        >
          {{ input.paths.map(p => p.path).join(', ') }}
        </u-info-list-item>
        <u-info-list-item
          v-if="input.containerName"
          label="容器名称"
        >
          {{ input.containerName }}
        </u-info-list-item>
        <u-info-list-item
          v-if="input.matchFields.length > 0"
          label="元信息/注入Pod标记"
        >
          <kube-table
            table-width="100%"
            :columns="[
              { title: '类型', name: 'label' },
              { title: 'Key', name: 'key' }]"
            :items="input.matchFields"
          />
        </u-info-list-item>
        <u-info-list-item
          v-if="input.fields.length > 0"
          label="元信息/自定义标记"
        >
          <kube-table
            table-width="100%"
            :columns="[
              { title: '类型', name: 'label' },
              { title: 'Key', name: 'key' }]"
            :items="input.fields"
          />
        </u-info-list-item>
        <u-info-list-item
          v-if="input.multiline.pattern"
          label="日志多行配置"
        >
          <kube-table
            table-width="100%"
            :columns="[
              { title: 'Pattern', name: 'pattern' },
              { title: 'Negate', name: 'negate' },
              { title: 'Negate', name: 'match' }]"
            :items="[input.multiline]"
          />
        </u-info-list-item>
        <u-info-list-item
          v-if="input.maxBytes"
          label="单条日志大小上限"
        >
          {{ input.maxBytes }} bytes
        </u-info-list-item>
        <u-info-list-item
          v-if="input.excludeFiles.length"
          label="排除日志"
        >
          {{ input.excludeFiles.map(p => p.path).join(', ') }}
        </u-info-list-item>
        <u-info-list-item
          v-if="input.maxBytes"
          label="忽略日志文件时长"
        >
          {{ input.ignore_older }} h
        </u-info-list-item>
        <u-info-list-item
          v-if="input.cleanLogs[input.retainMode]"
          label="日志保留"
        >
          {{ input.retainMode | modeFilter }} {{ input.cleanLogs[input.retainMode] }} {{ input.retainMode | modeUnitFilter }}
        </u-info-list-item>
      </kube-list-block>
    </u-info-list-group>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import { LOG_TYPE } from 'kubecube/utils/constance';
export default {
    filters: {
        logType(val) {
            return LOG_TYPE[val];
        },
        modeUnitFilter(val) {
            if (val === 'retainNum') {
                return '个';
            }
            return '天';
        },
        modeFilter(val) {
            if (val === 'retainNum') {
                return '保留文件数';
            }
            return '保留时间';
        },
    },
    props: {
        instance: Object,
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
    },
};
</script>

<style>

</style>
