<template>
  <div>
    <u-linear-layout style="margin-bottom: 20px;">
      <u-select
        v-model="currentStatus"
        size="large normal"
        :data="statusList"
      />
    </u-linear-layout>
    <x-request
      ref="request"
      :service="jobService"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :columns="columns"
          :loading="loading"
          :error="error"
          :items="data || []"
        >
          <template #[`item.status.runningStatus`]="{ item }">
            {{ item.status.runningStatus | getJobStatusText }}
          </template>
          <template #[`item.jobstatus`]="{ item }">
            {{ item.status.succeeded }} / {{ item.spec && item.spec.completions }}
          </template>
          <template #[`item.period`]="{ item }">
            {{ getJobPeriod(item) }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-link-list>
              <u-link-list-item @click="deleteItem(item)">
                删除
              </u-link-list-item>
            </u-link-list>
          </template>
        </kube-table>
      </template>
    </x-request>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import extendWorkloadService from 'kubecube/services/k8s-extend-resource';
import { toPlainObject as toJobPlainObject } from 'kubecube/k8s-resources/job';
import {
    JOB_STATUS_MAP,
} from 'kubecube/utils/constance';
import {
    getPeriod,
} from 'kubecube/utils/functional';

export default {
    filters: {
        getJobStatusIcon(status = 'Pending') {
            return (JOB_STATUS_MAP[status] || JOB_STATUS_MAP.Pending).icon;
        },
        getJobStatusText(status = 'Pending') {
            return (JOB_STATUS_MAP[status] || JOB_STATUS_MAP.Pending).text;
        },
    },
    props: {
        instance: Object,
    },
    data() {
        const statusList = Object.keys(JOB_STATUS_MAP)
            .map(key => ({ value: key, text: JOB_STATUS_MAP[key].text }));
        statusList.unshift({ text: '全部状态', value: '' });
        return {
            jobService: extendWorkloadService.getInstance,
            currentStatus: statusList[0].value,
            statusList,
            columns: [
                { title: '名称', name: 'metadata.name', sortable: true },
                { title: '状态', name: 'status.runningStatus', width: '160px' },
                { title: '执行情况（完成/全部）', name: 'jobstatus', width: '200px', sortable: true },
                { title: '运行时长', name: 'period', width: '160px', sortable: true },
                { title: '操作', name: 'operation', sortable: false, width: '100px' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.instance.metadata.name,
                },
            };
        },
    },
    watch: {
        currentStatus() {
            this.refresh();
        },
    },
    methods: {
        resolver(response) {
            const jobs = getFunc(response, 'extendInfo.jobs');
            const t = (jobs || []).map(toJobPlainObject)
                .filter(j => (this.currentStatus ? getFunc(j, 'status.runningStatus') === this.currentStatus : true));
            return t;
        },
        refresh() {
            this.$refs.request.request();
        },
        getJobPeriod(item) {
            let period = '';
            if (item.status && item.status.startTime) {
                const { startTime, completionTime } = item.status;
                period = completionTime ? getPeriod(startTime, completionTime) : getPeriod(startTime);
            }
            return period;

        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: this.workload,
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteBatchInstance(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
