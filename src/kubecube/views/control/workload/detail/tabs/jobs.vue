<template>
  <div>
    <div style="margin-bottom: 12px;">
      <el-select
        v-model="currentStatus"
        style="width: 200px"
      >
        <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
        />
      </el-select>
      <!-- <u-select
        v-model="currentStatus"
        size="large normal"
        :data="statusList"
      /> -->
    </div>
    <x-request
      ref="request"
      :service="jobService"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="metadata.name"
            label="名称"
          >
          </el-table-column>
          <el-table-column
            prop="status.runningStatus"
            label="状态"
            width="160"
          >
            <template slot-scope="{ row }">
              {{ row.status.runningStatus | getJobStatusText }}
            </template>
          </el-table-column>
          <el-table-column
            prop="jobstatus"
            label="执行情况（完成/全部）"
            width="200"
          >
            <template slot-scope="{ row }">
              {{ row.status.succeeded || 0 }} / {{ row.spec && row.spec.completions || 0 }}
            </template>
          </el-table-column>
          <el-table-column
            prop="period"
            label="运行时长"
            width="200"
          >
            <template slot-scope="{ row }">
              {{ getJobPeriod(row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="操作"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-link type="primary" @click="deleteItem(row)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
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
            this.$eConfirm({
                title: '删除',
                message: `确定删除 ${item.metadata.name} 吗？`,
                width: '460px',
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
            })
        },
    },
};
</script>

<style>

</style>
