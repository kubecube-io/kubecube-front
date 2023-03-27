<template>
  <div>
    <el-form ref="form" :model="model" label-position="right" label-width="120px">
      <el-form-item
        label="租户"
        prop="tenant"
        :rules="[
          validators.required(),
        ]"
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
          <el-select
            v-model="model.tenant"
          >
            <el-option
              v-for="optionItem in tenants"
              :key="optionItem.value"
              :label="optionItem.text"
              :value="optionItem.value"
            />
          </el-select>
        </x-request>
      </el-form-item>
      <template v-if="tenants.length">
        <x-request
          ref="request"
          :service="tenantClusterService"
          :params="tenantClusterParams"
          :processor="tenantClusterResolver"
        >
          <template slot-scope="{ data, loading }">
            <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
            <template v-else>
              <x-request
                ref="requestcluster"
                :service="clusterService"
                :processor="clusterResolver(data)"
              >
                <template slot-scope="{ loading: quotaLoading }">
                  <i v-if="quotaLoading" class="el-icon-loading" style="font-size: 24px"/>
                  <template v-else>
                    <el-form-item
                      label="集群"
                      prop="cluster"
                      :rules="[
                        validators.required(),
                      ]"
                    >
                      <el-select
                        v-if="clusters.length"
                        v-model="model.cluster"
                      >
                        <el-option
                          v-for="optionItem in clusters"
                          :key="optionItem.value"
                          :label="optionItem.text"
                          :value="optionItem.value"
                        />
                      </el-select>
                      <el-input
                        v-else
                        v-bind="$attrs"
                        placeholder="暂无集群"
                        disabled
                      />
                    </el-form-item>
                    <template v-if="clusters.length > 0">
                      <x-request
                        ref="requestQuota"
                        :service="quotaService"
                        :params="quotaParams"
                        :processor="quotaResolver"
                      >
                        <el-form-item label="共享资源">
                          <hard-quota
                            v-model="model.model"
                            :item="model.used"
                            :availables="model.availables"
                            prefixKey="model."
                          />
                        </el-form-item>
                      </x-request>
                    </template>
                  </template>
                </template>
              </x-request>
            </template>
          </template>
        </x-request>
      </template>
      <el-form-item
        label="存储资源"
        prop="model.spec.hard.requestsStorage"
        :rules="[
          validators.required(),
          validators.consistofNumber(),
          validators.numberBetween(0),
        ]"
      >
        <el-input v-model="model.model.spec.hard['requestsStorage']" style="width: 300px"/>
        <span style="line-height:32px;margin-left:8px">GiB</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit" :loading="submitLoading">确 定</el-button>
      </el-form-item>
    </el-form>
  </div>
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
import hardQuota from '../quota/el-hard-quota-table.vue';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import BigNumber from 'bignumber.js';
import * as validators from 'kubecube/utils/validators';

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
            validators,
            submitLoading: false,
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
            this.model.used = {
                usedCpu: this.model.model.status.used.cpu,
                usedMemory: this.model.model.status.used.memory,
                usedGpu: this.model.model.status.used.gpu,
                usedLimitsCpu: this.model.model.status.used.limitsCpu,
                usedLimitsMemory: this.model.model.status.used.limitsMemory,
            };
            this.model.availables = {
                cpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityCpu)).minus(unitConvertCPU(clusterQuota.assignedCpu)).plus(this.model.model.status.hard.cpu),
                memory: +new BigNumber(unitConvertMemory(clusterQuota.capacityMem)).minus(unitConvertMemory(clusterQuota.assignedMem)).plus(this.model.model.status.hard.memory),
                gpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityGpu)).minus(unitConvertCPU(clusterQuota.assignedGpu)).plus(this.model.model.status.hard.gpu),
                storage: Infinity,
            };



            // this.quotaType = cubeQuotaResponse ? 'edit' : 'create';
            // this.model.model = toCubeResourceQoutaPlainObject(cubeQuotaResponse);
            // this.model.used = {
            //   usedCpu: this.model.model.status.used.cpu,
            //   usedMemory: this.model.model.status.used.memory,
            //   usedGpu: this.model.model.status.used.gpu,
            // };
            // this.model.availables = {
            //     cpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityCpu)).minus(unitConvertCPU(clusterQuota.assignedCpu)).plus(this.model.model.status.hard.cpu),
            //     memory: +new BigNumber(unitConvertMemory(clusterQuota.capacityMem)).minus(unitConvertMemory(clusterQuota.assignedMem)).plus(this.model.model.status.hard.memory),
            //     gpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityGpu)).minus(unitConvertCPU(clusterQuota.assignedGpu)).plus(this.model.model.status.hard.gpu),
            //     // storage: item.totalStorage - item.usedStorage,
            // };
        },

        async submit() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
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
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style>

</style>
