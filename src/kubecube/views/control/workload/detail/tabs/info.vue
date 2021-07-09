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
        {{ cluster }}
      </u-info-list-item>
      <u-info-list-item label="空间">
        {{ namespace }}
      </u-info-list-item>
      <u-info-list-item label="创建时间">
        {{ instance.metadata.creationTimestamp | smartDateFormat }}
      </u-info-list-item>

      <template v-if="workload === 'cronjobs'">
        <u-info-list-item label="状态">
          {{ instance.status.runningStatus | getJobStatusIcon }}
        </u-info-list-item>
        <u-info-list-item label="正在运行任务数">
          0
        </u-info-list-item>
        <u-info-list-item label="并发策略">
          {{ instance.spec.concurrencyPolicy }}
        </u-info-list-item>
        <u-info-list-item label="定时调度设置">
          {{ instance.spec.schedule }}
        </u-info-list-item>
        <u-info-list-item label="保留执行成功任务的个数">
          {{ instance.spec.successfulJobsHistoryLimit }}
        </u-info-list-item>
        <u-info-list-item label="保留执行失败任务的个数">
          {{ instance.spec.failedJobsHistoryLimit }}
        </u-info-list-item>
        <u-info-list-item
          v-if="instance.spec.startingDeadlineSeconds"
          label="任务启动截止时间"
        >
          {{ instance.spec.startingDeadlineSeconds }}
        </u-info-list-item>
      </template>

      <u-info-list-item label="标签">
        <span
          v-for="label in instance.metadata.labels"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
      <!-- ??? -->
      <u-info-list-item label="注释">
        {{ instance.description || '-' }}
      </u-info-list-item>
      <u-info-list-item
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
      </u-info-list-item>
      <u-info-list-item
        label="标签选择器"
        column="1"
      >
        <span
          v-for="label in instance.spec.matchLabels"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
      <!-- <u-info-list-item label="级别" v-if="moduleName === 'daemonsets'">
            <u-linear-layout>
                <span>{{ model.clusterWide | userLevel }}</span>
                <span v-if="!model.clusterWide">{{ model.tenantName }}</span>
            </u-linear-layout>
        </u-info-list-item> -->
      <u-info-list-item
        v-if="workload === 'deployments'"
        label="更新策略"
      >
        <template v-if="instance.spec.strategy.type === 'RollingUpdate'">
          RollingUpdate，maxSurge：{{ instance.spec.strategy.maxSurge }}，maxUnavailable：{{ instance.spec.strategy.maxUnavailable }}
        </template>
        <template v-else>
          {{ instance.spec.strategy.type }}
        </template>
      </u-info-list-item>
      <template v-if="workload === 'statefulsets'">
        <u-info-list-item label="服务名">
          {{ instance.spec.serviceName }}
        </u-info-list-item>
        <u-info-list-item label="存储声明模板">
          {{ instance.spec.volumeClaimTemplates.enable ? instance.spec.volumeClaimTemplates.templates.map(i => i.name).join('，'): '-' }}
        </u-info-list-item>
      </template>

      <template v-if="workload === 'jobs'">
        <u-info-list-item label="状态">
          <u-status-icon :name="instance.status.runningStatus | getJobStatusIcon" /> {{ instance.status.runningStatus | getJobStatusText }}
        </u-info-list-item>
        <u-info-list-item label="预期成功执行数">
          {{ instance.spec.completions }}
        </u-info-list-item>
        <u-info-list-item label="并行数">
          {{ instance.spec.parallelism }}
        </u-info-list-item>
        <u-info-list-item label="超时时间">
          {{ instance.spec.activeDeadlineSeconds === undefined ? '-' : instance.spec.activeDeadlineSeconds + '秒' }}
        </u-info-list-item>
        <u-info-list-item label="重试次数">
          {{ instance.spec.backoffLimit }}
        </u-info-list-item>
      </template>
    </u-info-list-group>

    <u-info-list-group
      title="部署模板"
      column="1"
      label-size="large"
    >
      <u-info-list-item label="容器">
        {{ instance.containers.map(c => c.containerName).join('，') }}
      </u-info-list-item>
      <u-info-list-item label="标签">
        <span
          v-for="label in instance.podTemplate.metadata.labels"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
      <u-info-list-item label="重启策略">
        {{ instance.podTemplate.spec.restartPolicy }}
      </u-info-list-item>
    </u-info-list-group>
    <u-info-list-group
      v-if="workload !== 'cronjobs'"
      title="条件"
    >
      <kube-table
        table-width="100%"
        :columns="columns"
        :items="instance.status.conditions"
      >
        <template #[`item.condition`]="{ item }">
          <span>{{ item.type }}: {{ item.status }}</span>
        </template>
        <template #[`item.message`]="{ item }">
          <span :class="$style.message">{{ item.message }}</span>
        </template>
        <template #[`item.lastchecktime`]="{ item }">
          {{ item.lastUpdateTime | formatLocaleTime }}
        </template>
        <template #[`item.lastchangetime`]="{ item }">
          {{ item.lastTransitionTime | formatLocaleTime }}
        </template>
        <template #noData>
          暂无 条件
        </template>
      </kube-table>
    </u-info-list-group>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import {
    JOB_STATUS_MAP,
} from 'kubecube/utils/constance';
export default {
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

    data() {
        return {
            columns: [
                { title: '条件', name: 'condition', width: '180px' },
                { title: '消息', name: 'message' },
                { title: '上次检测时间', name: 'lastchecktime', width: '180px' },
                { title: '上次转换时间', name: 'lastchangetime', width: '180px' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
    },
    created() {
        console.log(this.instance);
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
</style>
