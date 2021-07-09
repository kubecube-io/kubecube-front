<template>
  <div>
    <u-linear-layout
      style="margin-bottom: 20px;"
      direction="horizontal"
    >
      <u-linear-layout
        direction="horizontal"
        class="kube-clear"
      >
        <kube-input-search
          :align-right="true"
          placeholder="请输入名称搜索"
          @search="onSearch"
        />
      </u-linear-layout>

      <!-- <search-tag :class="$style.search" :tagTypes="tagTypes" @search="searchNodes" :limit="10"></search-tag> -->
    </u-linear-layout>
    <x-request
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          resizable
          @sort="onSort"
        >
          <template #[`item.pool`]="{ item }">
            {{ cephCluster(item) }}
          </template>
          <template #[`item.provisioner`]="{ item }">
            {{ item.provisioner | cephTypeText }}
          </template>
          <!-- <template #[`item.reclaimPolicy`]="{ item }">
            {{ item.reclaimPolicy }}
          </template> -->
          <template #[`item.spec.unschedulable`]="{ item }">
            {{ item.spec.unschedulable ? '不可调度' : '可调度' }}
          </template>
          <template #[`item.operation`]="{item}">
            <u-link-list>
              <u-link-list-item @click="viewYAML(item)">
                查看详情
              </u-link-list-item>
              <u-link-list-item @click="deleteItem(item)">
                删除
              </u-link-list-item>
            </u-link-list>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              没有搜索到相关内容，可调整关键词重新搜索
            </template>
            <template v-else>
              还没有任何 持久存储
            </template>
          </template>
        </kube-table>
      </template>
    </x-request>
    <taint-dialog
      ref="taintdialog"
      :instance="instance"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import {
    toPlainObject as toStoragePlainObject,
} from 'kubecube/k8s-resources/persistentvolumes';
import taintDialog from '../dialogs/taint.vue';
import {
    CEPH_TYPE_MAP,
} from 'kubecube/utils/constance';

export default {
    filters: {
        cephTypeText(val) {
            return CEPH_TYPE_MAP[val] || val;
        },
    },
    components: {
        taintDialog,
    },
    mixins: [ PageMixin ],

    props: {
        instance: Object,
    },
    data() {
        return {
            service: workloadService.getResourceListWithoutNamespace,
            selectRows: [],
            columns: [
                { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                { title: '状态', name: 'status.phase' },
                { title: '类型', name: 'type' },
                { title: '来源', name: 'provisioner' },
                { title: '访问模式', name: 'spec.accessModes' },
                { title: '存储类别', name: 'spec.storageClassName' },
                { title: '容量', name: 'spec.capacity.storage' },
                { title: '声明', name: 'spec.claimRef.name', textwrap: true },
                { title: '操作', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'persistentvolumes',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
        resolver(response) {
            return {
                list: (response.items || []).map(toStoragePlainObject),
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = `${name}`;
            this.pagenation.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            this.pagenation.selector = content ? `metadata.name~${content}` : undefined;
        },
        cephCluster(item) {
            return get(item, 'metadata.annotations["ceph-cluster-name"]')
            || get(item, 'metadata.annotations["cephfs-cluster-name"]');
        },
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'persistentvolumes',
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getResourceWithoutNamespace(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— 查看 YAML`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.instance.clusterName,
                            resource: 'persistentvolumes',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteResourceWithoutNamespace(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
