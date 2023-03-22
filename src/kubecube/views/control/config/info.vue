<template>
  <div>
    <el-descriptions title="基本信息" :column="1">
      <el-descriptions-item :label="`${workloadLiteral}名称`">
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
      <el-descriptions-item
        v-if="workload === 'secrets'"
        label="类型"
      >
        {{ instance.type || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="数据" :column="1" />
    <el-table
      :data="instance.data || []"
      style="width: 100%"
    >
      <el-table-column
        prop="key"
        label="key"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="value"
        label="value"
      >
        <template slot-scope="{ row }">
          <enhanceQzEditor
            v-if="workload === 'configmaps'"
            style="border: 1px solid #E1E8ED"
            height="100"
            v-model="row.value"
            theme="vs"
            language="yaml"
            :options="{ minimap: {enabled: false}, readOnly: true }"
          />
          <template v-else>
            {{row.value}}
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
export default {
    props: {
        instance: Object,
    },
    data() {
        return {
            column: [
                { title: 'key', name: 'key', textwrap: true, width: '120px' },
                { title: 'value', name: 'value', textwrap: true },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        workloadLiteral() {
            switch (this.workload) {
                case 'configmaps':
                    return 'Configmap';
                case 'secrets':
                    return 'Secret';
                default:
                    return '';
            }
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
