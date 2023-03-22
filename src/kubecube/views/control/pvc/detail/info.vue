<template>
  <div>
    <el-button
      type="primary"
      style="margin-bottom: 12px"
      @click="viewYAML"
    >
      查看详细信息
    </el-button>
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item label="存储声明名称">
        {{ instance.metadata.name }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        {{ instance.status.phase }}
      </el-descriptions-item>
      <el-descriptions-item label="持久存储">
        {{ instance.spec.volumeName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="存储类别">
        {{ instance.spec.storageClassName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="容量">
        {{ instance.spec.resources.requests.storage || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="模式">
        {{ instance.spec.accessMode | accessModeFilter }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="关联的副本" :column="1" />
    <x-request
      ref="request"
      :service="podService"
      :params="params"
      :processor="podResolver"
    >
      <template slot-scope="{ data, loading, error }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
        >
          <el-table-column
            prop="metadata.name"
            label="副本名称"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link type="primary" :to="{path: `/control/pods/${row.metadata.name}/info`, query: $route.query}">
                {{ row.metadata.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="status.phase"
            label="副本状态"
            width="80"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column
            prop="status.podIP"
            label="IP"
            width="100"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{row.status.podIP || '-'}}
            </template>
          </el-table-column>
          <el-table-column
            prop="status.hostIP"
            label="所在节点IP"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template slot-scope="{ row }">
              {{row.status.hostIP || '-'}}
            </template>
          </el-table-column>
          <el-table-column
            prop="creationTimestamp"
            label="创建时间"
            width="180"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.metadata.creationTimestamp | formatLocaleTime }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
// import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubecube/k8s-resources/pod/index.js';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubecube/utils/constance';
export default {
    filters: {
        accessModeFilter(val) {
            return PVC_MODE_TEXT_MAP[val] || '-';
        },
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            podService: workloadExtendService.getPVCPods,
            podColumn: [
                { title: '副本名称', name: 'metadata.name' },
                { title: '副本状态', name: 'status.phase', width: '80px' },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: '所在节点IP', name: 'status.hostIP', width: '100px' },
                { title: '重启次数', name: 'status.restartCount', width: '100px' },
                { title: '创建时间', name: 'creationTimestamp', width: '180px' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    pvcName: this.instance.metadata.name,
                },
                params: {
                    pageSize: 10000,
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                },
            };
        },
        serviceColumn() {
            const columns = [
                { title: '目标端口', name: 'targetPort', width: '100px' },
                { title: '协议', name: 'protocol', width: '100px' },
                { title: '服务端口', name: 'port', width: '100px' },
                { title: '名称', name: 'name' },
            ];
            if (this.instance.template === 'nodePort') {
                columns.splice(3, 0, { title: 'NodePort', name: 'nodePort', width: '100px' });
            }
            return columns;
        },
    },
    methods: {
        podResolver(response) {
            const items = (response.pods || []).map(toPodPlainObject);
            console.log(items);
            return items;
        },
        viewYAML() {
            this.$editResource({
                title: `${this.instance.metadata.name} —— 查看详细信息`,
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
