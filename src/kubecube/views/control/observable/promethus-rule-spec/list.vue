<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout direction="horizontal">
      <u-button
        icon="create"
        color="primary"
        @click="toCreate"
      >
        创建告警策略
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

    <x-request
      ref="request"
      :service="service"
      :params="{}"
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
          <template #[`item.metadata.name`]="{ item, itemMeta }">
            <u-label
              v-if="item.alerts.length"
              :class="$style.label"
              :color="getAlertColor(getAlert(item.alerts))"
              @click="itemMeta.expand = !itemMeta.expand"
            >
              {{ getAlert(item.alerts) }}
            </u-label>
            <u-label
              v-else
              :class="$style.label"
              color="success"
            >
              normal
            </u-label>
            {{ item.metadata.name }}
          </template>
          <template #[`item.spec.rule.severity`]="{ item }">
            {{ item.spec.rule.severity | criticalFilter }}
          </template>
          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list :key="workload">
                <u-link-list-item @click="editItem(item)">
                  设置
                </u-link-list-item>
                <u-link-list-item @click="deleteItem(item)">
                  删除
                </u-link-list-item>
                <!-- <u-link-list-item @click="editYAML(item)">
                  YAML 设置
                </u-link-list-item> -->
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              没有搜索到相关内容，可调整关键词重新搜索
            </template>
            <template v-else>
              还没有任何 告警策略组 现在就 <u-link @click="toCreate">
                立即创建
              </u-link>
              一个吧
            </template>
          </template>

          <template #expand="{ data }">
            <div :class="$style.indent">
              <kube-table
                :items="data ? data.alerts : []"
                :columns="alertcolumns"
              >
                <template #[`item.metric.alertstate`]="{ item }">
                  <u-label :color="getAlertColor(item.metric.alertstate)">
                    {{ item.metric.alertstate }}
                  </u-label>
                </template>
                <template #[`item.labels`]="{ item }">
                  <span
                    v-for="label in toObjectArray(item.metric, 'key', 'value')"
                    :key="label.key"
                    class="u-chip"
                  >
                    {{ `${label.key}=${label.value}` }}
                  </span>
                </template>
              </kube-table>
            </div>
          </template>
          <template #error>
            获取数据失败，请
            <u-link @click="refresh">
              重试
            </u-link>
          </template>
        </kube-table>
        <u-page
          v-if="data && calculatePages(data.total) > 1"
          :count="data.total"
          :page-size="pagenation.pageSize"
          :total="calculatePages(data.total)"
          @select="selectPage"
        />
      </template>
    </x-request>
  </u-linear-layout>
</template>

<script>
import { pickBy, get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import {
    toPlainObject as toPrometheusRulePlainObject,
} from 'kubecube/k8s-resources/prometheusRule';
import monitorService from 'kubecube/services/monitor';
import {
    resolveTemplate,
} from 'kubecube/k8s-resources/monitor/utils.js';
import {
    rulespecCRD,
    critical,
} from '../utils';
import {
    toObjectArray,
} from 'kubecube/k8s-resources/base/utils.js';
const template = 'sum (ALERTS{cluster="$cluster",kubecube_io_owner=~"$tenant-$project.*"}) without(receive,tenant_id)';
const queryFunc = resolveTemplate(template);
export default {

    metaInfo() {
        return {
            title: '告警规则 - kubecube',
        };
    },
    filters: {
        criticalFilter(val) {
            const t = critical.find(c => c.value === val);
            if (t) return t.text;
            return '-';
        },
    },
    mixins: [ PageMixin ],
    data() {
        return {
            columns: [
                { title: '告警名称', name: 'metadata.name' },
                { title: '告警规则', name: 'spec.rule.expr' },
                { title: '告警策略组', name: 'spec.rule.ams' },
                { title: '告警程度', name: 'spec.rule.severity' },
                { title: '创建时间', name: 'metadata.creationTimestamp', width: '180px' },
                { title: '操作', name: 'operation', width: '180px' },
            ],
            alertcolumns: [
                { title: 'state', width: '180px', name: 'metric.alertstate' },
                { title: 'labels', name: 'labels', textwrap: true },
            ],
        };
    },
    computed: {
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        namespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        service() {
            return () => Promise.all([
                workloadService.getNamespaceCRResource(this.requestParam),
                monitorService.queryInstant({
                    params: {
                        query: queryFunc({
                            cluster: this.cluster,
                            tenant: this.tenant,
                            project: this.project,
                        }),
                        time: Date.now() / 1000,
                    },
                }),
            ]);
            // return workloadService.getNamespaceCRResource;
        },
        deleteService() {
            return workloadService.deleteNamespaceCRResource;
        },
        instanceService() {
            return workloadService.getNamespaceCRResourceInstance;
        },
        modifyService() {
            return workloadService.modifyNamespaceCRResource;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    ...rulespecCRD,
                },
                params: {
                    ...pickBy(this.pagenation, i => !!i), // has to be this
                },
            };
        },
        workload() {
            return this.$route.params.workload;
        },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        toObjectArray,
        getAlertColor(val) {
            switch (val) {
                case 'normal':
                    return 'success';
                case 'pending':
                    return 'warning';
                case 'firing':
                    return 'error';
                default:
                    return '-';
            }
        },
        getAlert(alerts) {
            const arr = [ 'normal', 'pending', 'firing' ];
            let idx = 0;
            alerts.forEach(alert => {
                idx = Math.max(arr.findIndex(p => p === alert.metric.alertstate), idx);
            });
            return arr[idx];
        },
        resolver(response) {
            const [ prometheusRuleResponse, statusResponse ] = response;
            const list = (prometheusRuleResponse.items || []).map(toPrometheusRulePlainObject).map(p => {
                const alerts = (getFunc(statusResponse, 'data.result') || []).filter(d => d.metric.alertname === p.metadata.name);
                return {
                    ...p,
                    alerts,
                };
            });
            return {
                list,
                total: prometheusRuleResponse.total,
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
        toCreate() {
            // this.$refs.editDialog.open();
            this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        // view() {

        // },
        // closeItem(item) {

        // },
        // async editYAML(item) {
        //     const reqParam = {
        //         pathParams: {
        //             ...this.requestParam.pathParams,
        //             name: item.metadata.name,
        //         },
        //     };
        //     const response = await this.instanceService(reqParam);

        //     this.$editResource({
        //         title: `${item.metadata.name} —— YAML 设置`,
        //         content: response,
        //         onSubmit: async content => {
        //             await this.modifyService({
        //                 ...reqParam,
        //                 data: content,
        //             });
        //             this.refresh();
        //         },
        //     });
        // },
        editItem(item) {
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/edit`,
            });
        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            ...this.requestParam.pathParams,
                            name: item.metadata.name,
                        },
                    };
                    await this.deleteService(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style module>
.indent{
    padding-left: 20px;
}
.label{
    margin-right: 1em;
    cursor: pointer;
}

</style>
