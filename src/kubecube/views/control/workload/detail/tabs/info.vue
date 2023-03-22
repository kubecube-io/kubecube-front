<template>
  <div :class="$style.root">
    <el-button
      type="primary"
      style="margin-bottom: 12px"
      @click="viewYAML"
    >
      查看详细信息
    </el-button>
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item label="集群名称">
        {{ cluster }}
      </el-descriptions-item>
      <el-descriptions-item label="空间">
        {{ namespace }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ instance.metadata.creationTimestamp | smartDateFormat }}
      </el-descriptions-item>
      <template v-if="workload === 'cronjobs'">
        <el-descriptions-item label="状态">
          {{ instance.spec.suspend ? '暂停' : '已启动' }}
        </el-descriptions-item>
        <el-descriptions-item label="正在运行任务数">
          {{ (instance.status.active || []).length }}
        </el-descriptions-item>
        <el-descriptions-item label="并发策略">
          {{ instance.spec.concurrencyPolicy }}
        </el-descriptions-item>
        <el-descriptions-item label="定时调度设置">
          {{ instance.spec.schedule }}
        </el-descriptions-item>
        <el-descriptions-item label="保留执行成功任务的个数">
          {{ instance.spec.successfulJobsHistoryLimit }}
        </el-descriptions-item>
        <el-descriptions-item label="保留执行失败任务的个数">
          {{ instance.spec.failedJobsHistoryLimit }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="instance.spec.startingDeadlineSeconds"
          label="任务启动截止时间"
        >
          {{ instance.spec.startingDeadlineSeconds }}
        </el-descriptions-item>
      </template>
      <el-descriptions-item label="标签">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.metadata.labels" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <!-- ??? -->
      <el-descriptions-item label="注释">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.metadata.annotations" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="['deployments', 'statefulsets'].includes(workload) "
        label="副本"
      >
        <div v-if="workload === 'deployments'">
          {{ instance.status.desired }} desired，
          {{ instance.status.updated }} updated，
          {{ instance.status.available }} available，
          {{ instance.status.unavailable }} unavailable，
          {{ instance.status.total }} total
        </div>
        <div v-if="workload === 'statefulsets'">
          {{ instance.status.desired }} desired，
          {{ instance.status.total }} total
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        label="标签选择器"
        :column="1"
      >
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.spec.matchLabels" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="级别" v-if="workload === 'daemonsets'">
        {{instance.spec.level.ind === 'platform' ? '平台级' : ''}}
        {{instance.spec.level.ind === 'tenant' ? instance.spec.level.tenant : ''}}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="workload === 'deployments'"
        label="更新策略"
      >
        <template v-if="instance.spec.strategy.type === 'RollingUpdate'">
          RollingUpdate，maxSurge：{{ instance.spec.strategy.maxSurge }}，maxUnavailable：{{ instance.spec.strategy.maxUnavailable }}
        </template>
        <template v-else>
          {{ instance.spec.strategy.type }}
        </template>
      </el-descriptions-item>
      <template v-if="workload === 'statefulsets'">
        <el-descriptions-item label="服务名">
          {{ instance.spec.serviceName }}
        </el-descriptions-item>
        <el-descriptions-item label="存储声明模板">
          {{ instance.spec.volumeClaimTemplates.enable ? instance.spec.volumeClaimTemplates.templates.map(i => i.name).join('，'): '-' }}
        </el-descriptions-item>
      </template>

      <template v-if="workload === 'jobs'">
        <el-descriptions-item label="状态">
          <statusIcon :name="instance.status.runningStatus | getJobStatusIcon"/> {{ instance.status.runningStatus | getJobStatusText }}
        </el-descriptions-item>
        <el-descriptions-item label="预期成功执行数">
          {{ instance.spec.completions }}
        </el-descriptions-item>
        <el-descriptions-item label="并行数">
          {{ instance.spec.parallelism }}
        </el-descriptions-item>
        <el-descriptions-item label="超时时间">
          {{ instance.spec.activeDeadlineSeconds === undefined ? '-' : instance.spec.activeDeadlineSeconds + '秒' }}
        </el-descriptions-item>
        <el-descriptions-item label="重试次数">
          {{ instance.spec.backoffLimit }}
        </el-descriptions-item>
      </template>
    </el-descriptions>
    <el-descriptions title="部署模板" :column="1">
      <el-descriptions-item label="容器">
        {{ instance.containers.map(c => c.containerName).join('，') }}
      </el-descriptions-item>
      <el-descriptions-item label="标签">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.podTemplate.metadata.labels" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="重启策略">
        {{ instance.podTemplate.spec.restartPolicy }}
      </el-descriptions-item>
    </el-descriptions>
    <template v-if="workload !== 'cronjobs'">
      <el-descriptions title="条件" :column="1" />
      <el-table
        :data="instance.status.conditions"
        style="width: 100%"
      >
        <el-table-column
          prop="condition"
          label="条件"
          :show-overflow-tooltip="true"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.type }}: {{ row.status }}
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="消息"
        >
          <template slot-scope="{ row }">
            {{ row.message }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastchecktime"
          label="上次检测时间"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.lastUpdateTime | formatLocaleTime }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastchangetime"
          label="上次转换时间"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.lastTransitionTime | formatLocaleTime }}
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import {
    JOB_STATUS_MAP,
} from 'kubecube/utils/constance';
import statusIcon from 'kubecube/elComponent/status-icon.vue';
export default {
    components: {
        statusIcon,
    },
    filters: {
        getJobStatusIcon(status = 'Pending') {
            return (JOB_STATUS_MAP[status] || JOB_STATUS_MAP.Pending).icon;
        },
        getJobStatusText(status = 'Pending') {
            return (JOB_STATUS_MAP[status] || JOB_STATUS_MAP.Pending).text;
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
.message {
    word-break: break-word;
    white-space: break-spaces;
}
/* .root :global(.el-tag+.el-tag){
  margin-left: 10px;
} */
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
