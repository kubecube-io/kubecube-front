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
      <el-descriptions-item label="Pod 名称">
        {{ instance.metadata.name }}
      </el-descriptions-item>
      <el-descriptions-item label="集群名称">
        {{ cluster }}
      </el-descriptions-item>
      <el-descriptions-item label="空间">
        {{ namespace }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ instance.metadata.creationTimestamp | smartDateFormat }}
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
      <el-descriptions-item label="所属节点">
        {{ instance.spec.nodeName }}
      </el-descriptions-item>
      <el-descriptions-item label="终止宽限期">
        {{ instance.spec.terminationGracePeriodSeconds }}s
      </el-descriptions-item>
      <el-descriptions-item label="重启策略">
        {{ instance.spec.restartPolicy }}
      </el-descriptions-item>
      <el-descriptions-item label="条件">
        {{ instance.status.conditions | conditionFilter }}
      </el-descriptions-item>
      <el-descriptions-item label="控制器">
        {{ ((instance.metadata.ownerReferences || [])[0] || {}).name }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="容器" :column="1"/>
    <el-table
      :data="instance.containers"
      style="width: 100%"
    >
      <el-table-column
        prop="containerName"
        label="容器名称"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          <el-tooltip effect="dark" :content="getContainerText(row.type)" placement="top" popper-class="ncs-el-tooltip-popper">
            <u-icons
              style="color: #508de8;"
              :name="row.type | getContainerIcon"
            />
          </el-tooltip>
          {{ row.containerName }}
        </template>
      </el-table-column>
      <el-table-column
        prop="image"
        label="镜像"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="status"
        label="容器状态"
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot-scope="{ row }">
          {{ Object.keys(row.status.state)[0] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status.restartCount"
        label="重启次数"
        :show-overflow-tooltip="true"
        width="100"
      />
      <el-table-column
        prop="operation"
        label="操作"
        width="160"
      >
        <template slot-scope="{ row }">
          <el-link type="primary" @click="$termModal.open('container', { cluster, namespace, pod: instance.metadata.name, container: row.containerName })" style="marginRight:10px">
            console
          </el-link>
          <el-link type="primary" @click="toLog(row)">
            查看日志
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import { CONTAINERTYPE } from 'kubecube/utils/constance';

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
