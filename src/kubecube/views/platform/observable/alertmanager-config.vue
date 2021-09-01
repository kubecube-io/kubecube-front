<template>
  <u-linear-layout direction="vertical">
    <x-request
      ref="request"
      :service="getAlarmManagerConfigService()"
      :params="{}"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data || []"
          :error="error"
        >
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list>
                <u-link-list-item @click="editItem(item)">
                  {{ item.config ? '设置': '创建' }}
                </u-link-list-item>
                <u-link-list-item
                  v-if="item.config"
                  @click="deleteItem(item)"
                >
                  删除
                </u-link-list-item>
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            还没有任何 告警策略组 请先创建集群，再创建告警策略组
          </template>
        </kube-table>
      </template>
    </x-request>
    <edit-dialog
      ref="editDialog"
      @refresh="refresh"
    />
  </u-linear-layout>
</template>

<script>
import { get as geFunc } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import clusterService from 'kubecube/services/cluster';
import { toPlainObject as toGlobalAlertPlainObject } from 'kubecube/k8s-resources/alarmmanagerconfigspec/global.js';
import editDialog from './alermanager-dialog.vue';
const SECRET_NAMESPACE = 'kubecube-monitoring';


export default {
    components: {
        editDialog,
    },
    metaInfo() {
        return {
            title: '全局告警配置 - kubecube',
        };
    },
    data() {
        return {
            columns: [
                { title: '集群', name: 'cluster.clusterName' },
                { title: '告警配置', name: 'config.metadata.name' },
                { title: '操作', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        toPlainObject() {
            return d => d;
        },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        getAlarmManagerConfigService() {
            return async () => {
                const clusterRes = await clusterService.getClusters({
                    params: {
                        status: 'normal',
                    },
                });
                const list = geFunc(clusterRes, 'items', []);
                const response = await Promise.all(list.map(async l => {
                    try {
                        const res = await workloadService.getAPIV1Instance({
                            pathParams: {
                                cluster: l.clusterName,
                                namespace: SECRET_NAMESPACE,
                                resource: 'secrets',
                                name: 'alertmanager-kubecube-monitoring-alertmanager',
                            },
                            silent: true,
                        });
                        return {
                            cluster: l,
                            config: res && toGlobalAlertPlainObject(res),
                        };
                    } catch (err) {
                        return {
                            cluster: l,
                            config: null,
                        };
                    }
                }));
                return response;
            };
        },
        resolver(response) {
            return response;
        },
        refresh() {
            this.$refs.request.request();
        },

        toCreate() {
            this.$refs.editDialog.open();
            // this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        view() {

        },
        editItem(item) {
            this.$refs.editDialog.open(item);
        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.cluster.clusterName} 的全局告警配置吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: item.cluster.clusterName,
                            namespace: SECRET_NAMESPACE,
                            resource: 'secrets',
                            name: 'alertmanager-kubecube-monitoring-alertmanager',
                        },
                    };
                    await workloadService.deleteAPIV1Instance(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
