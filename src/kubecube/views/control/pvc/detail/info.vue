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
      <u-info-list-item label="存储声明名称">
        {{ instance.metadata.name }}
      </u-info-list-item>
      <u-info-list-item label="状态">
        {{ instance.status.phase }}
      </u-info-list-item>
      <u-info-list-item label="持久存储">
        {{ instance.spec.volumeName || '-' }}
      </u-info-list-item>
      <u-info-list-item label="存储类别">
        {{ instance.spec.storageClassName || '-' }}
      </u-info-list-item>
      <u-info-list-item label="容量">
        {{ instance.spec.resources.requests.storage || '-' }}
      </u-info-list-item>
      <u-info-list-item label="模式">
        {{ instance.spec.accessMode | accessModeFilter }}
      </u-info-list-item>
    </u-info-list-group>

    <u-info-list-group
      title="关联的副本"
      column="1"
      label-size="large"
    >
      <x-request
        ref="request"
        :service="podService"
        :params="params"
        :processor="podResolver"
      >
        <template slot-scope="{ data, loading, error }">
          <kube-table
            table-width="100%"
            :columns="podColumn"
            :loading="loading"
            :error="error"
            :items="data || []"
          >
            <template #[`item.metadata.name`]="{ item }">
              <u-link :to="{path: `/control/pods/${item.metadata.name}/info`}">
                {{ item.metadata.name }}
              </u-link>
            </template>
            <template #noData>
              暂无数据
            </template>
          </kube-table>
        </template>
      </x-request>
    </u-info-list-group>
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
            podService: workloadExtendService.getWorkloads,
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
                    resource: 'pods',
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
            const items = (response.items || []).map(toPodPlainObject);
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
