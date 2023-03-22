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
      <el-descriptions-item label="服务名称">
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
      <el-descriptions-item label="标签选择器">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.spec.matchLabels" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="类型">
        {{ instance.spec.type }}
      </el-descriptions-item>
      <el-descriptions-item label="集群 IP">
        {{ instance.spec.clusterIP }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="instance.spec.type === 'LoadBalancer'"
        label="IP 类型"
      >
        {{ instance.spec.ipTypeText }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="instance.spec.type === 'LoadBalancer'"
        label="网络带宽"
      >
        {{ instance.spec.bandWidth }}Mbps
      </el-descriptions-item>
      <el-descriptions-item
        v-if="instance.spec.type === 'ClusterIP' && instance.spec.template === 'external'"
        label="External IP"
      >
        {{(instance.spec.externalIPs || []).join(', ')}}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="服务详情" :column="1">
      <el-descriptions-item label="域名">
        {{ instance.spec.host }}
      </el-descriptions-item>
      <el-descriptions-item label="端口">
        <el-table
          :data="instance.spec.ports"
          style="width: 100%"
        >
          <el-table-column
            prop="targetPort"
            label="目标端口"
          ></el-table-column>
          <el-table-column
            prop="protocol"
            label="协议"
          ></el-table-column>
          <el-table-column
            prop="port"
            label="服务端口"
          ></el-table-column>
          <el-table-column
            v-if="instance.spec.type === 'NodePort'"
            prop="nodePort"
            label="NodePort"
          ></el-table-column>
          <el-table-column
            prop="name"
            label="名称"
          ></el-table-column>
        </el-table>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="副本" :column="1"/>
    <x-request
      ref="request"
      :service="podService"
      :params="params"
      :processor="podResolver"
    >
      <template slot-scope="{ data, loading }">
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
          ></el-table-column>
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
          <el-table-column
            prop="operation"
            label="操作"
            width="180"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link type="primary" :to="{ path: `/control/services/${instance.metadata.name}/event`, query: { ...$route.query, kind: 'pod', pod: row.metadata.name } }">
                查看事件
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
// import workloadService from '@micro-app/ncs/kubecube/services/k8s-resource';
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
            // podService: workloadExtendService.getWorkloads,
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
            if (this.instance.spec.type === 'NodePort') {
                columns.splice(3, 0, { title: 'NodePort', name: 'nodePort', width: '100px' });
            }
            return columns;
        },
    },
    methods: {
        async podService(params) {
            if (!params.params.selector) {
                return {
                    items: [],
                };
            }
            const res = await workloadExtendService.getWorkloads(params)
            return res;
        },
        podResolver(response) {
            const items = (response.items || []).map(toPodPlainObject);
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
