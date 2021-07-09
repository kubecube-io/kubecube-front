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
      <u-info-list-item label="Pod 名称">
        {{ instance.metadata.name }}
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
        <span
          v-for="label in instance.metadata.annotations"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
      <u-info-list-item label="所属节点">
        {{ instance.spec.nodeName }}
      </u-info-list-item>
      <u-info-list-item label="终止宽限期">
        {{ instance.spec.terminationGracePeriodSeconds }}s
      </u-info-list-item>
      <u-info-list-item label="重启策略">
        {{ instance.spec.restartPolicy }}
      </u-info-list-item>
      <u-info-list-item label="条件">
        {{ instance.status.conditions | conditionFilter }}
      </u-info-list-item>
      <u-info-list-item label="控制器">
        {{ ((instance.metadata.ownerReferences || [])[0] || {}).name }}
      </u-info-list-item>
    </u-info-list-group>
    <u-info-list-group
      title="容器"
      column="1"
      label-size="large"
    >
      <kube-table
        table-width="100%"
        :columns="columns"
        :items="instance.containers"
      >
        <template #[`item.containerName`]="{ item }">
          <u-linear-layout gap="small">
            <u-icons
              v-tooltip.top="getContainerText(item.type)"
              style="color: #508de8;"
              :name="item.type | getContainerIcon"
            />
            {{ item.containerName }}
          </u-linear-layout>
        </template>
        <template #[`item.status`]="{ item }">
          {{ Object.keys(item.status.state)[0] }}
        </template>
        <template #[`item.operation`]="{ item }">
          <u-linear-layout gap="small">
            <u-link-list>
              <u-link-list-item @click="$kubeterm({ pod: instance.metadata.name, container: item.containerName })">
                console
              </u-link-list-item>
              <u-link-list-item @click="toLog(item)">
                查看日志
              </u-link-list-item>
            </u-link-list>
          </u-linear-layout>
        </template>
      </kube-table>
    </u-info-list-group>
    <!-- <kube-term ref="kubeterm" /> -->
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import { CONTAINERTYPE } from 'kubecube/utils/constance';
// import kubeTerm from 'kubecube/component/global/xterm/kube-terminal.vue';

export default {
    filters: {
        conditionFilter(val) {
            [ 'Initialized', 'Ready', 'PodScheduled' ].map(key => {
                const condition = (val || []).find(item => item.type === key);
                return condition ? key + ': ' + condition.status : '';
            }).filter(item => item).join(', ');
        },
        getContainerIcon(type) {
            return (CONTAINERTYPE[type] || {}).icon || 'container';
        },
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            columns: [
                { title: '容器名称', name: 'containerName' },
                { title: '镜像', name: 'image', width: '40%' },
                { title: '容器状态', name: 'status', width: '100px' },
                { title: '重启次数', name: 'status.restartCount', width: '100px' },
                { title: '操作', name: 'operation', width: '200px' },
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
    methods: {
        viewYAML() {
            this.$editResource({
                title: `${this.instance.metadata.name} —— 查看详细信息`,
                content: this.instance.puresource,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        getContainerText(type) {
            return (CONTAINERTYPE[type] || {}).text || '业务容器';
        },
        toLog(item) {
            this.$router.push({
                name: 'control.workload.log',
                params: this.$route.params,
                query: {
                    podName: this.instance.metadata.name,
                    containerName: item.containerName,
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
