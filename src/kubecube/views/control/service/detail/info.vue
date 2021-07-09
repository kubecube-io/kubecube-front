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
      <u-info-list-item label="服务 名称">
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
      <u-info-list-item label="标签选择器">
        <span
          v-for="label in instance.spec.matchLabels"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>

      <u-info-list-item label="类型">
        {{ instance.spec.type }}
      </u-info-list-item>
      <u-info-list-item label="集群 IP">
        {{ instance.spec.clusterIP }}
      </u-info-list-item>
      <u-info-list-item
        v-if="instance.spec.type === 'loadBalancer'"
        label="IP 类型"
      >
        <div>{{ instance.spec.ipTypeText }}</div>
      </u-info-list-item>
      <u-info-list-item
        v-if="instance.spec.type === 'loadBalancer'"
        label="网络带宽"
      >
        <div>{{ instance.spec.bandWidth }}Mbps</div>
      </u-info-list-item>
    </u-info-list-group>

    <u-info-list-group
      title="服务详情"
      column="1"
      label-size="large"
    >
      <u-info-list-item label="域名">
        {{ instance.spec.host }}
      </u-info-list-item>
      <u-info-list-item label="端口">
        <kube-table
          table-width="100%"
          :columns="serviceColumn"
          :items="instance.spec.ports"
        >
          <template #noData>
            暂无数据
          </template>
        </kube-table>
      </u-info-list-item>
    </u-info-list-group>

    <u-info-list-group
      title="副本"
      column="1"
      label-size="large"
    >
      <x-request
        ref="request"
        :service="podService"
        :params="params"
        :processor="podResolver"
      >
        <template slot-scope="{ data, loading }">
          <kube-table
            table-width="100%"
            :columns="podColumn"
            :loading="loading"
            :items="data || []"
          >
            <template #[`item.metadata.name`]="{ item }">
              <u-link :to="{path: `/control/pods/${item.metadata.name}/info`}">
                {{ item.metadata.name }}
              </u-link>
            </template>
            <template #[`item.operation`]="{ item }">
              <u-linear-layout gap="small">
                <u-link-list>
                  <u-link-list-item :to="{ path: `/control/services/${instance.metadata.name}/event`, query: { kind: 'pod', pod:item.metadata.name } }">
                    查看事件
                  </u-link-list-item>
                </u-link-list>
              </u-linear-layout>
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
export default {
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
                { title: '创建时间', name: 'creationTimestamp', width: '180px' },
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
