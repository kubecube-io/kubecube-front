<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout>
      <u-text>集群</u-text>
      <cluster-selector v-model="cluster" />
      <u-button
        icon="create"
        color="primary"
        @click="toCreate"
      >
        创建告警规则
      </u-button>
    </u-linear-layout>
    <x-request
      v-if="cluster"
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
        >
          <template #[`item.metadata.name`]="{ item }">
            {{ item.metadata.name }}
          </template>
          <template #[`item.spec.rule.severity`]="{ item }">
            {{ item.spec.rule.severity | criticalFilter }}
          </template>
          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.regularnum`]="{ item }">
            {{ getRuleSum(item) }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list>
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
            获取数据失败，请<u-link @click="refresh">
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
import { omit, get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import PageMixin from 'kubecube/mixins/pagenation';
import workloadService from 'kubecube/services/k8s-resource';
import clusterSelector from '../namespace/cluster-select.vue';
import monitorService from 'kubecube/services/monitor';
import {
    resolveTemplate,
} from 'kubecube/k8s-resources/monitor/utils.js';
import {
    toPlainObject as toPrometheusRulePlainObject,
    RESOURCE,
    CRITICALS,
} from 'kubecube/k8s-resources/prometheusRule/global';
const MONITOR_NAMESPACE = 'kubecube-monitoring';
const template = 'sum (ALERTS{cluster="$cluster",kubecube_io_owner=~"$tenant-$project.*"}) without(receive,tenant_id)';
const queryFunc = resolveTemplate(template);

export default {
    filters: {
        criticalFilter(val) {
            const t = CRITICALS.find(c => c.value === val);
            if (t) return t.text;
            return '-';
        },
    },
    components: {
        clusterSelector,
    },
    mixins: [ PageMixin ],
    beforeRouteLeave(to, from, next) {
        if (to.query.cluster) {
            next({
                path: to.path,
                query: omit(to.query, [ 'cluster' ]),
            });
        } else {
            next();
        }
    },
    metaInfo() {
        return {
            title: '告警规则 - kubecube',
        };
    },
    data() {
        return {
            cluster: this.$route.query.cluster ? { value: this.$route.query.cluster, clusterName: this.$route.query.cluster } : null,
            columns: [
                { title: '告警名称', name: 'metadata.name' },
                // { title: '告警规则', name: 'spec.rule.expr' },
                // { title: '告警策略组', name: 'spec.rule.ams' },
                // { title: '告警程度', name: 'spec.rule.severity' },
                { title: '规则数量', name: 'regularnum', width: '100px' },
                { title: '创建时间', name: 'metadata.creationTimestamp', width: '180px' },
                { title: '操作', name: 'operation', width: '100px' },
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
        service() {
            return () => Promise.all([
                workloadService.getNamespaceCRResource(this.params),
                monitorService.queryInstant({
                    params: {
                        query: queryFunc({
                            cluster: getFunc(this.cluster, 'clusterName'),
                            tenant: this.tenant,
                            project: this.project,
                        }),
                        time: Date.now() / 1000,
                    },
                }),
            ]);
            // return workloadService.getNamespaceCRResource;
        },
        params() {
            return {
                pathParams: {
                    cluster: getFunc(this.cluster, 'clusterName'),
                    namespace: MONITOR_NAMESPACE,
                    ...RESOURCE,
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
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
        view() {

        },
        editItem(item) {
            this.$router.push({ path: `/platform/PrometheusRule/${getFunc(this.cluster, 'clusterName')}/${item.metadata.name}/edit` });
        },
        toCreate() {
            this.$router.push({ path: `/platform/PrometheusRule/${getFunc(this.cluster, 'clusterName')}/create` });
        },
        getRuleSum(item) {
            let num = 0;
            item.spec.groups.forEach(g => {
                num += g.rules.length;
            });
            return num;
        },
        deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster.clusterName,
                            name: item.metadata.name,
                            ...RESOURCE,
                        },
                    };
                    await workloadService.deleteNamespaceCRResource(reqParam);
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
