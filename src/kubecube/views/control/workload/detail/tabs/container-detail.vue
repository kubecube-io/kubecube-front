<template>
  <div>
    <headCard
      :title="containerName"
    />
     <el-tabs value="0" page="main">
      <el-tab-pane
        label="详情"
        :name="0"
      />
    </el-tabs>
    <div v-if="message">
      {{ message }}
    </div>
    <div v-else>
      <el-button
        type="primary"
        style="margin-bottom: 20px;"
        @click="viewYAML"
      >
        查看详细信息
      </el-button>
      <el-descriptions title="基本信息" :column="1">
        <el-descriptions-item label="名称">
          {{ container.containerName }}
        </el-descriptions-item>
        <el-descriptions-item label="镜像">
          {{ container.image }}
        </el-descriptions-item>
        <el-descriptions-item label="镜像拉取策略">
          {{ container.imagePullPolicy }}
        </el-descriptions-item>
        <el-descriptions-item label="资源限制" contentStyle="display:block" labelStyle="align-self: flex-start;">
          <div>
            <el-table
              :data="resourceData"
              style="width: 100%;"
            >
              <el-table-column
                prop="type"
                label=""
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="cpu"
                label="CPU"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="memory"
                label="MEMORY"
                :show-overflow-tooltip="true"
              ></el-table-column>
            </el-table>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="挂载数据卷" contentStyle="display:block" labelStyle="align-self: flex-start;">
          <div>
            <el-table
              :data="volumns"
              style="width: 100%;"
            >
              <el-table-column
                prop="name"
                label="存储声明"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="mountPath"
                label="挂载点"
                :show-overflow-tooltip="true"
              ></el-table-column>
            </el-table>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubecube/k8s-resources/pod/index.js';
import {
    toPlainObject as toDepPlainObject,
} from 'kubecube/k8s-resources/deployment/index.js';
import { CONTAINERTYPE } from 'kubecube/utils/constance';

export default {
    filters: {
        getContainerIcon(type) {
            return (CONTAINERTYPE[type] || {}).icon || 'container';
        },
    },
    data() {
        return {
            instance: {},
            container: {},
            resourceData: [],
            volumns: [],
            message: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        name() {
            return this.$route.params.instance;
        },
        workload() {
            return this.$route.params.workload;
        },
        podName() {
            return this.$route.params.pod;
        },
        containerName() {
            return this.$route.params.container;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.name,
                },
            };
        },
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                },
                params: {
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                },
            };
        },
    },
    created() {
        this.load();
    },

    methods: {
        async load() {
            try {
                const res = await (this.workload === 'jobs' ? workloadService.getBatchInstance : workloadService.getInstance)(this.requestParam);
                this.instance = toDepPlainObject(res);
                const response = await workloadService.getAPIV1(this.params);
                const target = (response.items || []).find(d => d.metadata.name === this.podName);
                const containers = getFunc(toPodPlainObject(target), 'containers', []);
                this.container = containers.find(c => c.containerName === this.containerName);
                const resource = this.container.raw.resources;
                this.resourceData = [
                    { type: 'requests', cpu: getFunc(resource, 'requests.cpu', '-'), memory: getFunc(resource, 'requests.memory', '-') },
                    { type: 'limits', cpu: getFunc(resource, 'limits.cpu', '-'), memory: getFunc(resource, 'limits.memory', '-') },
                ];
                this.volumns = this.container.raw.volumeMounts;
                console.log(this.container);
            } catch (err) {
                this.message = 'container 不存在';
            }
        },
        getContainerText(type) {
            return (CONTAINERTYPE[type] || {}).text || '业务容器';
        },
        getContainer(data) {
            data = data || [];
            const target = data.find(d => d.metadata.name === this.podName);
            return getFunc(target, 'containers', []);
        },
        viewYAML() {
            this.$editResource({
                title: `${this.container.containerName} —— 查看 YAML`,
                content: this.container.raw,
                editorOption: {
                    readOnly: true,
                },
            });
        },
    },
};
</script>

<style module>
.button {
    margin-bottom: 20px;
}
</style>
