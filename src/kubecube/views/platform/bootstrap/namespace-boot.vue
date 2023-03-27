<template>
  <kube-pipe
    ref="pipe"
    graph="tenant > project"
    @pipestatechange="pipeLoading = $event"
  >
    <el-form ref="form" :model="model" label-position="right" label-width="120px">
      <el-form-item
        label="集群"
        prop="pipe.cluster"
        :rules="[
          validators.required(),
        ]"
      >
        <cluster-select
          v-model="model.pipe.cluster"
          no-title
        />
      </el-form-item>
      <el-form-item
        label="空间名称"
        prop="pipe.namespace"
        :rules="[
          validators.required(),
          validators.k8sResourceNameValidator(),
        ]"
      >
        <el-input
          v-model="model.pipe.namespace"
          placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"
        />
      </el-form-item>
      <el-form-item
        label="租户"
        prop="pipe.tenant"
        :rules="[
          validators.required(),
        ]"
      >
        <tenantSelect
          v-model="model.pipe.tenant"
        />
      </el-form-item>
      <el-form-item
        label="关联项目"
        prop="pipe.project"
        :rules="[
          validators.required(),
        ]"
      >
        <project-select
          v-model="model.pipe.project"
          auth="writable"
          no-empty
          :tenant="model.pipe.tenant && model.pipe.tenant.value"
        />
      </el-form-item>
      <x-request
        ref="request"
        v-if="model.pipe.cluster && model.pipe.tenant"
        :service="quotaService"
        :params="params"
        :processor="resolver"
      >
        <el-form-item
          label="计算资源"
        >
          <hardQuota
            v-model="model.resource"
            prefixProp="resource"
            :availables="model.availables"
          />
        </el-form-item>
        <el-form-item
          label="存储资源"
          prop="resource.spec.hard.storage"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.numberBetween(0, model.availables.storage),
          ]"
        >
          <el-input
            v-model="model.resource.spec.hard.storage"
            style="width: 200px"
          />
          <span style="line-height:32px;margin-left:8px">GiB</span>
        </el-form-item>
      </x-request>
      <el-form-item>
        <el-button type="primary" @click="submit" :loading="submitting">创 建</el-button>
      </el-form-item>
    </el-form>
  </kube-pipe>
</template>

<script>
import {
    toPlainObject as toResourceQuotaPlainObject,
    patchK8SObject as patchResourceQuotaPK8SObject,
} from 'kubecube/k8s-resources/resourceQuota/index.js';

import {
    toPlainObject as toCubeResourceQoutaPlainObject,
} from 'kubecube/k8s-resources/cubeResourceQuota/index.js';
import {
    toK8SObject as toSubnamespaceK8SObject,
} from 'kubecube/k8s-resources/subnamespace';

import clusterSelect from '../namespace/cluster-select.vue';
import scopeService from 'kubecube/services/scope';
import hardQuota from '../namespace/el-ns-quota-table.vue';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import * as validators from 'kubecube/utils/validators';
import tenantSelect from 'kubecube/elComponent/global/tenant-select.vue';
import projectSelect from 'kubecube/elComponent/global/project-select.vue';
import BigNumber from 'bignumber.js';
import userService from 'kubecube/services/user';

export default {
    components: {
        clusterSelect,
        hardQuota,
        tenantSelect,
        projectSelect,
    },
    mixins: [ makeVModelMixin ],
    props: {
        state: Boolean,
    },
    data() {
        return {
            quotaService: scopeService.getCubeQuotaResourceInstance,
            pipeLoading: false,
            validators,
            submitting: false,
        };
    },
    computed: {
        params() {
            return {
                pathParams: {
                    name: `${this.model.pipe.cluster.value}.${this.model.pipe.tenant.value}`,
                },
            };
        },
    },
    watch: {

        state(val) {
            if (val) {
                this.$refs.pipe.pipeRequest();
            }
        },
    },
    methods: {
        resolver(cubeQuotaResponse) {
            if (!cubeQuotaResponse) {
                this.model.availables = {
                    cpu: 0,
                    limitsCpu: 0,
                    memory: 0,
                    limitsMemory: 0,
                    gpu: 0,
                    storage: 0,
                };
                return;
            }
            this.model.resource = toResourceQuotaPlainObject();
            const quota = toCubeResourceQoutaPlainObject(cubeQuotaResponse);
            Object.assign(this.model.availables, {
                cpu: quota.status.hard.cpu - quota.status.used.cpu, // - unitConvertCPU(clusterQuota.assignedCpu),
                limitsCpu: quota.status.hard.limitsCpu - quota.status.used.limitsCpu,
                memory: quota.status.hard.memory - quota.status.used.memory, // - unitConvertMemory(clusterQuota.assignedMem),
                limitsMemory: quota.status.hard.limitsMemory - quota.status.used.limitsMemory,
                gpu: quota.status.hard.gpu - quota.status.used.gpu, // - unitConvertCPU(clusterQuota.assignedGpu),
                storage: +new BigNumber(quota.status.hard.storage).minus(quota.status.used.storage),
            });
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            const {
                cluster, namespace, tenant, project,
            } = this.model.pipe;
            try {
                this.submitting = true;
                const quota = patchResourceQuotaPK8SObject(
                    this.model.resource
                );
                const subnamespaceYaml = toSubnamespaceK8SObject({
                    namespace,
                    tenant: tenant.value,
                    project: project.value,
                    scope: project.spec.namespace,
                });
                const quotaYaml = {
                    apiVersion: 'v1',
                    kind: 'ResourceQuota',
                    metadata: {
                        name: `${cluster.value}.${tenant.value}.${project.value}.${namespace}`,
                        namespace,
                        labels: {
                            'kubecube.io/quota': `${cluster.value}.${tenant.value}`,
                            'kubecube.io/cluster': cluster.value,
                            'kubecube.io/tenant': tenant.value,
                            'kubecube.io/project': project.value,
                        },
                    },
                    ...quota,
                };
                await userService.createNSQuota({
                    data: {
                        cluster: cluster.value,
                        subNamespaceAnchor: subnamespaceYaml,
                        resourceQuota: quotaYaml,
                    },
                });
                this.$toast.success('创建成功');
                this.$refs.request.request();
            } catch (error) {
                console.log(error);
            }
            this.submitting = false;

            // const subnamespaceYaml = toSubnamespaceK8SObject({
            //     namespace,
            //     tenant: tenant.value,
            //     project: project.value,
            //     scope: project.spec.namespace,
            // });

            // const quota = toResourceQuotaPK8SObject(
            //     {
            //         cluster: cluster.value,
            //         namespace,
            //         tenant: tenant.value,
            //         project: project.value,
            //     },
            //     this.model.resource
            // );
            // await workloadService.createNamespaceCRResource({
            //     pathParams: {
            //         cluster: cluster.value,
            //         group: 'hnc.x-k8s.io',
            //         version: 'v1alpha2',
            //         plural: 'subnamespaceanchors',
            //         namespace: project.spec.namespace,
            //     },
            //     data: subnamespaceYaml,
            // });

            // await workloadService.createAPIV1Instance({
            //     pathParams: {
            //         cluster: cluster.value,
            //         namespace,
            //         resource: 'resourcequotas',
            //     },
            //     data: quota,
            // });

        },
    },
};
</script>

<style>

</style>
