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
      <u-info-list-item label="负载均衡名称">
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
    </u-info-list-group>
    <u-info-list-group
      title="负载均衡详情"
      column="1"
      label-size="large"
    >
      <!-- todo -->
      <!-- <x-request
        ref="request"
        :service="podService"
        :params="params"
        :processor="podResolver"
      >
        <template slot-scope="{ data, loading, error }">

        </template>
      </x-request> -->
      <u-info-list-item label="规则">
        <kube-table
          table-width="100%"
          :columns="pathColumn"
          :items="instance.spec.pathInfos || []"
        />
      </u-info-list-item>
    </u-info-list-group>
    <u-info-list-group
      title="关联的服务"
      column="1"
      label-size="large"
    >
      <kube-table
        table-width="100%"
        :columns="serviceColumn"
        :items="(instance.spec.services || []).map(s => ({ name: s }))"
      >
        <template #[`item.operation`]="{ item }">
          <u-link :to="{ path: `/control/services/${item.name}` }">
            查看服务
          </u-link>
        </template>
      </kube-table>
    </u-info-list-group>
    <!-- <u-info-list-item label="所属 Node">
        {{ ingConAddressText }}
      </u-info-list-item>
      <u-info-list-item label="规则">
        <u-table-view
          :data="model.pathInfos || []"
          layout="fixed"
          :loading="loading"
        >
          <u-table-view-column
            title="转发路径"
            label="url"
            width="70%"
            ellipsis
          />
          <u-table-view-column
            title="服务"
            label="service"
            width="30%"
            ellipsis
          />
          <div slot="no-data-text">
            暂无数据
          </div>
        </u-table-view>
      </u-info-list-item>
    </u-info-list-group> -->
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
</style>
