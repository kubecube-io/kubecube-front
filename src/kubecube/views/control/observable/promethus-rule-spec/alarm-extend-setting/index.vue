<template>
  <kube-form>
    <kube-form-item
      label="类型"
      required
    >
      <u-radios
        v-model="model.perspect"
        :disabled="isEdit"
        @select="handlePerspectSelect"
      >
        <u-radio label="metric">
          维度
        </u-radio>
        <u-radio label="event">
          事件
        </u-radio>
      </u-radios>
    </kube-form-item>
    <template v-if="model.perspect === 'metric'">
      <kube-form-item
        label="维度"
        required
      >
        <u-select
          v-model="model.dimension"
          :data="dimensions"
          :disabled="isEdit"
          @select="handleDimensionSelect"
        />
      </kube-form-item>
      <kube-form-item
        label="集群"
        required
      >
        {{ cluster }}
      </kube-form-item>
      <kube-form-item
        v-if="model.dimension !== 'namespace'"
        :label="scopesContent"
        required
      >
        <u-select
          v-model="model.scope"
          :data="scopesChoice"
          @select="handleScopeSelect"
        />
      </kube-form-item>
      <validation-provider
        v-if="cluster"
        v-slot="{ errors, validate }"
        rules="required"
      >
        <input
          v-model="model.targets"
          style="display:none"
        >
        <kube-form-item
          label="对象"
          layout="block"
          required
          :message="errors && errors[0]"
        >
          <u-radios
            v-if="model.dimension !== 'workload'"
            v-model="model.targetsAllChecked"
            :style="{'margin-bottom': '20px'}"
            @select="handelTargetsAllCheckedSelect"
          >
            <u-radio :label="true">
              所有{{ targetName }}
            </u-radio>
            <u-radio :label="false">
              选择已有的{{ targetName }}
            </u-radio>
          </u-radios>
          <x-request
            v-if="!model.targetsAllChecked"
            :service="loadTargets"
            :params="{ scope: model.scope, clusterName: cluster, dimension: model.dimension }"
          >
            <template slot-scope="{ loading, data }">
              <u-loading v-if="loading" />
              <u-checkbox-card
                v-else
                key="targets"
                :value.sync="model.targets"
                :data="data ? data : []"
                @change="validate"
              />
            </template>
          </x-request>
        </kube-form-item>
      </validation-provider>
      <kube-form-item
        v-if="cluster"
        label="规则"
        layout="block"
        required
      >
        <u-radios v-model="model.operation">
          <u-radio label="or">
            满足以下任意条件
          </u-radio>
          <u-radio label="and">
            满足以下所有条件
          </u-radio>
        </u-radios>
        <x-request
          :service="getRules"
          :params="{ dimension: model.dimension, scope: model.scope, clusterName: cluster }"
        >
          <template slot-scope="{ data: rules }">
            <u-form-table :style="{'margin-bottom': '20px'}">
              <thead>
                <tr>
                  <th width="240px">
                    指标
                  </th>
                  <th width="350px">
                    告警阈值
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(conditionItem, index) in model.conditions"
                  :key="conditionItem.key"
                >
                  <td>
                    <u-select
                      v-model="conditionItem.record"
                      :data="rules"
                      size="huge"
                      @select="handleRuleSelect($event, conditionItem)"
                    />
                  </td>
                  <td>
                    <u-linear-layout gap="small">
                      <u-select
                        v-model="conditionItem.operator"
                        :data="operators"
                        size="huge small"
                      />
                      <validation-provider
                        rules="required"
                      >
                        <u-input
                          v-model="conditionItem.value"
                          name="value"
                          style="margin-right: 2px;"
                          size="huge small"
                        />
                      </validation-provider>
                      <span>{{ {record: conditionItem.record, rules} | showRuleUnit }}</span>
                    </u-linear-layout>
                  </td>
                  <td>
                    <u-form-table-remove-button @click="removeCondition(index)" />
                  </td>
                </tr>
              </tbody>
            </u-form-table>
          </template>
        </x-request>
        <u-form-table-add-button @click="addCondition">
          添加
        </u-form-table-add-button>
      </kube-form-item>
    </template>
    <template v-else-if="model.perspect === 'event'">
      <kube-form-item
        label="集群"
        required
      >
        {{ cluster }}
      </kube-form-item>
      <validation-provider
        v-if="cluster"
        v-slot="{ errors, validate }"
        rules="required"
      >
        <input
          v-model="model.namespace"
          style="display:none"
        >
        <kube-form-item
          v-if="cluster"
          label="空间"
          required
          layout="block"
          :message="errors && errors[0]"
        >
          <x-request
            :service="loadNamespacesServer"
            :params="{clusterName: cluster}"
          >
            <template slot-scope="{ loading, data }">
              <u-loading v-if="loading" />
              <u-checkbox-card
                v-else
                key="spaces"
                :data="data || []"
                :value.sync="model.namespace"
                @change="validate"
              />
            </template>
          </x-request>
        </kube-form-item>
      </validation-provider>
      <validation-provider
        v-slot="{ errors, validate }"
        rules="required"
      >
        <input
          v-model="model.events"
          style="display:none"
        >
        <kube-form-item
          label="事件"
          required
          layout="block"
          :message="errors && errors[0]"
        >
          <u-checkbox-card
            key="events"
            :data="eventNotices"
            :value.sync="model.events"
            @change="validate"
          />
        </kube-form-item>
      </validation-provider>
    </template>
  </kube-form>
</template>
<script>
import _ from 'lodash';
import uCheckboxCard from 'library/common/u-checkbox-card';
import { EVENTS_MAPPING } from './mapping.js';
import { dimensions, scopesChoice, scopesContent } from './constance';
import clusterService from 'kubecube/services/cluster';
import k8sResourceService from 'kubecube/services/k8s-resource';
import nsService from 'kubecube/services/namespace';
import { get } from 'vuex-pathify';
const DEFAULT_VALUE = '';
const DEFAULT_OPERATOR = '>';
export default {
    components: {
        uCheckboxCard,
    },
    filters: {
        showRuleUnit: ({ record, rules }) => {
            if (record && rules) {
                const target = rules.find(i => i.value === record);
                return target ? target.unit : '';
            }
            return '';
        },
    },
    props: {
        isEdit: Boolean,
        extendInfo: Object,
    },
    data() {
        return {
            loadClusterService: clusterService.getClusters,
            model: this.extendInfo ? this.extendInfo : {
                perspect: 'metric',
                dimension: 'pod',
                namespace: [],
                events: [],
                scope: 'deployment',
                targets: [],
                operation: 'or',
                conditions: [{ key: 0, operator: '', value: '', record: '' }],
                targetsAllChecked: false,
            },
            eventNotices: EVENTS_MAPPING,
            operators: [
                { text: '>', value: '>' },
                { text: '=', value: '=' },
                { text: '<', value: '<' },
                { text: '>=', value: '>=' },
                { text: '<=', value: '<=' },
                { text: '!=', value: '!=' },
            ],
            dimensions,
            targetSource: [],
        };
    },
    computed: {
        tenant: get('scope/tenant'),
        project: get('scope/project'),
        cluster: get('scope/cluster@value'),
        scopesChoice() {
            return this.scopeTypesFunc(scopesChoice);
        },
        scopesContent() {
            return this.scopeTypesFunc(scopesContent);
        },
        targetName() {
            const temp = this.dimensions.find(i => i.value === this.model.dimension);
            return temp ? temp.text : this.model.dimension;
        },
    },
    methods: {
        handleDimensionSelect(event) {
            this.model.conditions = [{ key: 0, operator: '', value: '', record: '' }];
            if (event.value === 'namespace') {
                this.model.scope = 'namespace';
            } else {
                const temp = this.scopeTypesFunc(scopesChoice, event.value);
                if (temp && temp.length > 0) {
                    this.model.scope = temp[0].value;
                }
            }
        },
        handelTargetsAllCheckedSelect(event) {
            if (event.value) {
                this.model.targets = [ '.*' ];
            } else {
                this.model.targets = [];
            }
        },
        handleScopeSelect() {
            this.model.targets = [];
            this.model.targetsAllChecked = false;
            this.model.conditions = [{ key: 0, operator: '', value: '', record: '' }];
        },
        handlePerspectSelect(event) {
            this.model.targets = [];
            this.model.targetsAllChecked = false;
            if (event.value === 'metric') {
                this.model.conditions = [{ key: 0, operator: '', value: '', record: '' }];
            } else if (event.value === 'event') {
                this.model.conditions = [];
            }
        },
        loadNamespacesServer({ clusterName }) { return this.loadNamespaces(clusterName); },
        addCondition() {
            const key = this.model.conditions.length > 0 ? this.model.conditions[this.model.conditions.length - 1].key + 1 : 0;
            this.model.conditions.push({ key, operator: '', value: '', record: '' });
        },
        removeCondition(index) {
            if (this.model.conditions.length > 1) {
                this.model.conditions.splice(index, 1);
            }
        },
        async loadNamespaces(clusterName) {
            const params = {
                labelSelector: [],
                pageSize: 10000,
            };
            if (this.tenant) {
                params.labelSelector.push(`kubecube-tenant-${this.tenant.value}.tree.hnc.x-k8s.io/depth=2`);
            }
            if (this.project) {
                params.labelSelector.push(`kubecube-project-${this.project.value}.tree.hnc.x-k8s.io/depth=1`);
            }
            params.labelSelector = params.labelSelector.join(',');
            try {
                const response = await nsService.getNamespaces({
                    pathParams: {
                        cluster: clusterName,
                    },
                    params,
                });
                if (response.items) {
                    return response.items.map(i => ({
                        text: i.metadata.name,
                        value: i.metadata.name,
                    }));
                }
                return [];
            } catch (error) {
                console.log(error);
            }
            return [];
        },
        scopeTypesFunc(types, dimension) {
            const temp = dimension || this.model.dimension;
            switch (temp) {
                case 'pod':
                case 'container':
                case 'workload':
                    return types.workload;
                case 'storage':
                    return types.storage;
                case 'network':
                    return types.network;
                default:
                    return types.nodata;
            }
        },
        loadTargets({ scope }) {
            switch (scope) {
                case 'deployment':
                case 'statefulset':
                    return this.getWorkloads();
                case 'persistentvolumeclaim':
                case 'cephfsPersistentvolumeclaim':
                    return this.getPVC();
                case 'namespace':
                    return this.getNamespaces();
                default:
                    return Promise.reject();
            }
        },
        async getWorkloads() {
            const { scope, dimension } = this.model;
            const clusterName = this.cluster;
            const namespaces = await this.loadNamespaces(clusterName);
            const ServiceMapping = {
                deployment: k8sResourceService.getWorkloads,
                statefulset: k8sResourceService.getWorkloads,
            };
            const resourceMapping = {
                deployment: 'deployments',
                statefulset: 'statefulsets',
                // job: 'jobs',
            };
            const promises = namespaces.map(({ value }) => {
                return ServiceMapping[scope]({
                    params: { limit: 1000, offset: 0 },
                    pathParams: {
                        cluster: clusterName,
                        namespace: value,
                        resource: resourceMapping[scope],
                    },
                }).then(workloads => {
                    return workloads.items.map(item => {
                        const workloadName = item.metadata.name;
                        const containers = item.spec.template.spec.containers;
                        return {
                            // key 值和 dimension 对应
                            workload: [ `${value}.${workloadName}` ],
                            pod: [ `${value}.${workloadName}` ],
                            container: containers.map(c =>
                                `${value}.${workloadName}.${c.name}`),
                        };
                    });
                }).catch(err => {
                    console.log(err);
                    return [];
                });
            });
            return Promise.all(promises).then(result => {
                const data = _.flatten(result.map(workloads => _.flatten(workloads.map(item => item[dimension]))));
                return this.generateTargetSource(data);
            });
        },
        async getPVC() {
            const { scope } = this.model;
            const clusterName = this.cluster;
            const namespaces = await this.loadNamespaces(clusterName);
            const cephsReponse = await k8sResourceService.getStorage({
                params: {
                    limit: 1000, offset: 0,
                },
                pathParams: {
                    cluster: clusterName,
                    resource: 'storageclasses',
                },
            });
            const cephs = cephsReponse.items.filter((item = {}) => {
                return item.provisioner === 'ceph.com/cephfs';
            }).map(i => i.item.metadata.name);

            const promises = namespaces.map(({ value }) => {
                return k8sResourceService.getAPIV1({
                    params: {
                        limit: 1000, offset: 0,
                    },
                    pathParams: {
                        cluster: clusterName,
                        namespace: value,
                        resource: 'persistentvolumeclaims',
                    },
                }).then(r => {
                    return r.items.map(item => {
                        const pvc = `${item.metadata.namespace}.${item.metadata.name}`;
                        const pvccephfs = cephs.includes(item.spec.storageClassName) && pvc;
                        return {
                            pvc,
                            pvccephfs,
                        };
                    });
                }).catch(err => {
                    console.log(err);
                    return [];
                });
            });
            return Promise.all(promises).then(result => {
                if (scope === 'persistentvolumeclaim') {
                    const data = _.flatten(result.map(items => _.flatten(items.map(i => i.pvc))));
                    return this.generateTargetSource(data);
                }
                if (scope === 'cephfsPersistentvolumeclaim') {
                    const data = _.flatten(
                        result.map(items =>
                            _.flatten(items.filter(i => i.pvccephfs).map(i => i.pvccephfs))
                        )
                    );
                    return this.generateTargetSource(data);
                }
            });
        },
        async getNamespaces() {
            const clusterName = this.cluster;
            const namespaces = await this.loadNamespaces(clusterName);
            return namespaces;
        },
        async getRules({ scope, clusterName, dimension }) {
            try {
                const res = await k8sResourceService.getNamespaceCRResourceInstance({
                    params: {
                        limit: 1000, offset: 0,
                    },
                    pathParams: {
                        cluster: clusterName,
                        group: 'monitoring.coreos.com',
                        version: 'v1',
                        namespace: 'kubecube-monitoring',
                        plural: 'prometheusrules',
                        name: 'kubecube-monitoring-kubecube.rules',
                    },
                });
                let ruleName = '';
                if ([ 'namespace', 'pod', 'container', 'workload' ].includes(dimension)) {
                    ruleName = `${dimension}.rules`;
                } else if (dimension === 'storage') {
                    ruleName = `${scope}.rules`;
                }
                const target = res.spec.groups.find(item => item.name === ruleName);
                return target ? target.rules.map(i => {
                    return {
                        text: i.labels.cnName,
                        value: i.record,
                        unit: i.labels.unit,
                    };
                }) : [];
            } catch (error) {
                console.log(error);
            }
            return [];
        },
        handleRuleSelect(event, item) {
            const value = DEFAULT_VALUE;
            const operator = DEFAULT_OPERATOR;
            item.value = value;
            item.operator = operator;
            item.record = event.item.value;
        },
        generateTargetSource(targets) {
            return targets.map(t => (typeof t === 'string' ? ({
                text: t, value: t,
            }) : t));
        },
        $getData() {
            return this.model;
        },
        $getExpr() {
            const {
                perspect,
                namespace,
                events,
                targets,
                operation,
                conditions,
            } = this.model;
            if (perspect === 'metric') {
                const joinStr = operation === 'and' ? ' and on(target) ' : ' or ';
                return conditions.map(item => {
                    return `(${item.record}{target=~"${targets.join('|')}"}) ${item.operator} ${item.value}`;
                }).join(joinStr);
            } else if (perspect === 'event') {
                return `kube_event_count{namespace=~"${namespace.join('|')}",reason=~"${events.join('|')}"}`;
            }
            return '';
        },
    },
};
</script>
