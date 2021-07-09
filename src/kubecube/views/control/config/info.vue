<template>
  <div>
    <u-info-list-group
      title="基本信息"
      column="1"
      label-size="large"
    >
      <u-info-list-item :label="`${workloadLiteral}名称`">
        {{ instance.metadata.name }}
      </u-info-list-item>
      <u-info-list-item label="集群名称">
        {{ cluster }}
      </u-info-list-item>
      <u-info-list-item label="空间">
        {{ namespace }}
      </u-info-list-item>
      <u-info-list-item label="创建时间">
        {{ instance.metadata.creationTimestamp | formatLocaleTime }}
      </u-info-list-item>
      <u-info-list-item
        v-if="workload === 'secrets'"
        label="类型"
      >
        {{ instance.type || '-' }}
      </u-info-list-item>
    </u-info-list-group>

    <u-info-list-group
      title="数据"
      column="1"
      label-size="large"
    >
      <kube-table
        table-width="100%"
        :columns="column"
        :items="instance.data || []"
      >
        <template #noData>
          暂无数据
        </template>
      </kube-table>
    </u-info-list-group>
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
