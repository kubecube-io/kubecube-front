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
      <el-descriptions-item label="负载均衡名称">
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
    </el-descriptions>
    <el-descriptions title="负载均衡详情" :column="1">
      <el-descriptions-item label="规则">
        <el-table
          :data="instance.spec.pathInfos || []"
          style="width: 100%"
        >
          <el-table-column
            prop="url"
            label="转发路径"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="service"
            label="服务"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
        </el-table>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="关联的服务" :column="1"/>
    <el-table
      :data="(instance.spec.services || []).map(s => ({ name: s }))"
      style="width: 100%"
    >
      <el-table-column
        prop="name"
        label="服务名称"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="operation"
        label="操作"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          <el-link type="primary" :to="{ path: `/control/services/${row.name}`, query: $route.query }">
            查看服务
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubecube/k8s-resources/pod/index.js';

export default {
    props: {
        instance: Object,
    },
    data() {
        return {
            podService: workloadService.getAPIV1,
            pathColumn: [
                { title: '转发路径', name: 'url' },
                { title: '服务', name: 'service', width: '40%' },
            ],
            serviceColumn: [
                { title: '服务名称', name: 'name' },
                { title: '操作', name: 'operation', width: '40%' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
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
