<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form style="margin-top: 20px">
      <kube-form-item
        label="租户"
        required
      >
        <x-request
          ref="requestTenant"
          :service="userService"
          :params="{
            params: {
              user,
            }
          }"
          :processor="userResolver"
        >
          <u-select
            v-model="model.tenant"
            size="normal huge"
            :data="tenants"
          />
        </x-request>
      </kube-form-item>
      <template v-if="tenants.length">
        <x-request
          ref="request"
          :service="tenantClusterService"
          :params="tenantClusterParams"
          :processor="tenantClusterResolver"
        >
          <template slot-scope="{ data, loading }">
            <u-loading v-if="loading" />
            <template v-else>
              <x-request
                ref="requestcluster"
                :service="clusterService"
                :processor="clusterResolver(data)"
              >
                <template slot-scope="{ loading: quotaLoading }">
                  <u-loading v-if="quotaLoading" />
                  <template v-else>
                    <kube-form-item
                      label="集群"
                      required
                    >
                      <u-select
                        v-if="clusters.length"
                        v-model="model.cluster"
                        size="normal huge"
                        :data="clusters"
                      />
                      <u-select
                        v-else
                        disabled
                        :data="[{ text: '暂无集群' }]"
                      />
                    </kube-form-item>
                    <template v-if="clusters.length > 0">
                      <x-request
                        ref="requestQuota"
                        :service="quotaService"
                        :params="quotaParams"
                        :processor="quotaResolver"
                      >
                        <hard-quota
                          v-model="model.model"
                          style="width: 700px;margin-top:20px"
                          :item="model.used"
                          :availables="model.availables"
                        />
                      </x-request>
                    </template>
                  </template>
                </template>
              </x-request>
            </template>
          </template>
        </x-request>
      </template>
      <kube-form-item>
        <u-submit-button
          :click="submit.bind(this)"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                创建
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import {
    toPlainObject as toCubeResourceQoutaPlainObject,
    toK8SObject as toCubeResourceQoutaK8SObject,
    patchK8SObject as patchCubeResourceQoutaK8SObject,
} from 'kubecube/k8s-resources/cubeResourceQuota/index.js';
import {
    unitConvertMemory,
    unitConvertCPU,
} from 'kubecube/utils/functional';
import userService from 'kubecube/services/user';
import clusterService from 'kubecube/services/cluster';
import scopeService from 'kubecube/services/scope';
import hardQuota from '../quota/hard-quota-table.vue';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

export default {
    components: {
        hardQuota,
    },
    mixins: [ makeVModelMixin ],
    props: {
        state: Boolean,
    },
    data() {
        return {
            userService: userService.getUserTenants,
            tenantClusterService: clusterService.getClusterByScope,
            clusterService: clusterService.getClusters,
            tenants: [],
            clusters: [],
            quotaType: 'edit',
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
        tenantClusterParams() {
            const t = this.tenants.find(p => p.value === this.model.tenant);
            return {
                params: {
                    namespace: getFunc(t, 'spec.namespace'),
                },
            };
        },
        quotaParams() {
            return {
                pathParams: {
                    name: `${this.model.cluster}.${this.model.tenant}`,
                },
            };
        },
    },
    watch: {
        state(val) {
            if (val) {
                this.$refs.requestTenant.request();
            }
        },
    },
    methods: {
        async quotaService() {
            return await Promise.all([
                scopeService.getCubeQuotaResourceInstance(this.quotaParams),
                clusterService.getClusterQuata({
                    params: {
                        cluster: this.model.cluster,
                    },
                }),
            ]);
        },
        userResolver(data) {
            const items = data.items.map(i => ({
                text: getFunc(i, 'spec.displayName'),
                value: getFunc(i, 'metadata.name'),
            }));
            this.tenants = items;
            if (!this.model.tenant) {
                this.model.tenant = items[0].value;
            }
            return items;
        },
        tenantClusterResolver(response) {
            return getFunc(response, 'items', []);
        },
        clusterResolver(data) {
            return response => {
                const items = getFunc(response, 'items', []);
                const clusters = items.filter(i => data.includes(i.clusterName)).map(c => ({
                    text: c.clusterName,
                    value: c.clusterName,
                    ...c,
                    disabled: c.status !== 'normal',
                }));

                this.clusters = clusters;
                if (!this.model.cluster) {
                    const normalClusters = clusters.filter(i => !i.disabled);
                    this.model.cluster = normalClusters[0].value;
                }
                return clusters;
            };
        },
        quotaResolver([ cubeQuotaResponse, clusterQuota ]) {
            this.quotaType = cubeQuotaResponse ? 'edit' : 'create';
            this.model.model = toCubeResourceQoutaPlainObject(cubeQuotaResponse);
            console.log(clusterQuota);
            this.model.used = {
                usedCpu: unitConvertCPU(clusterQuota.assignedCpu),
                usedMemory: unitConvertMemory(clusterQuota.assignedMem),
                usedGpu: unitConvertCPU(clusterQuota.assignedGpu),
            };
            this.model.availables = {
                cpu: unitConvertCPU(clusterQuota.capacityCpu), // - unitConvertCPU(clusterQuota.assignedCpu),
                memory: unitConvertMemory(clusterQuota.capacityMem), // - unitConvertMemory(clusterQuota.assignedMem),
                gpu: unitConvertCPU(clusterQuota.capacityGpu), // - unitConvertCPU(clusterQuota.assignedGpu),
                // storage: item.totalStorage - item.usedStorage,
            };
        },

        async submit() {
            const {
                model,
                tenant,
                cluster,
            } = this.model;
            if (this.quotaType === 'edit') {
                const data = patchCubeResourceQoutaK8SObject(model, tenant, cluster);
                await scopeService.patchKubeDefineResource({
                    pathParams: {
                        name: model.metadata.name,
                    },
                    data,
                });
            } else {
                const data = toCubeResourceQoutaK8SObject(model, tenant, cluster);
                await scopeService.createCubeQuotaResource({
                    data,
                });
            }
            this.$toast.success('创建成功');
            this.$emit('next');
        },
    },
};
</script>

<style>

</style>
