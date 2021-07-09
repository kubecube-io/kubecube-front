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
        <u-button
          icon="create"
          color="primary"
          @click="createYAML"
        >
          创建存储类别
        </u-button>

        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
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
          @sort="onSort"
        >
          <template #[`item.pool`]="{ item }">
            {{ cephCluster(item) }}
          </template>
          <template #[`item.provisioner`]="{ item }">
            {{ item.provisioner | cephTypeText }}
          </template>
          <template #[`item.reclaimPolicy`]="{ item }">
            {{ item.reclaimPolicy }}
          </template>
          <template #[`item.spec.unschedulable`]="{ item }">
            {{ item.spec.unschedulable ? '不可调度' : '可调度' }}
          </template>
          <template #[`item.operation`]="{item}">
            <u-link-list>
              <u-link-list-item
                @click="deleteItem(item)"
              >
                删除
              </u-link-list-item>
            </u-link-list>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              没有搜索到相关内容，可调整关键词重新搜索
            </template>
            <template v-else>
              还没有任何 存储类别
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
    getDefaultModel as getStorageDefaultModel,
    toK8SObject as toStorageK8SObject,
} from 'kubecube/k8s-resources/storageclass';
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
            service: workloadService.getStorage,
            selectRows: [],
            columns: [
                { title: '名称', name: 'metadata.name', sortable: true },
                { title: '存储集群', name: 'pool' },
                { title: '类型', name: 'provisioner' },
                { title: '释放策略', name: 'reclaimPolicy' },
                { title: '操作', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        isControlCluster() {
            return !this.instance.isMemberCluster;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'storageclasses',
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
        createYAML() {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'storageclasses',
                },
            };
            const content = toStorageK8SObject(getStorageDefaultModel());
            this.$editResource({
                title: '创建存储类别',
                content,
                onSubmit: async content => {
                    await workloadService.createStorage({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
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
                            resource: 'storageclasses',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteStorage(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
