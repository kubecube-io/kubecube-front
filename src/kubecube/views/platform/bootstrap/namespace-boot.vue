<template>
  <kube-pipe
    graph="tenant > project"
    @pipestatechange="pipeLoading = $event"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <kube-form
        ref="form"
        style="margin-top: 20px"
      >
        <validation-provider
          name="Cluster"
          rules="required"
        >
          <kube-form-item
            label="集群"
            required
          >
            <cluster-select
              v-model="model.pipe.cluster"
              no-title
              size="normal huge"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          name="nsName"
          rules="required"
        >
          <kube-form-item
            label="空间名称"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.pipe.namespace"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          name="tenant"
          rules="required"
        >
          <kube-form-item
            label="租户"
            required
          >
            <kube-tenant-select
              v-model="model.pipe.tenant"
              size="normal huge"
            />
          </kube-form-item>
        </validation-provider>
        <validation-provider
          name="project"
          rules="required"
        >
          <kube-form-item
            label="关联项目"
            required
          >
            <kube-project-select
              v-model="model.pipe.project"
              size="normal huge"
              no-empty
              :tenant="model.pipe.tenant && model.pipe.tenant.value"
            />
          </kube-form-item>
        </validation-provider>

        <kube-form-item
          label="类型"
        >
          <u-text>共享</u-text>
        </kube-form-item>

        <template v-if="model.pipe.cluster && model.pipe.tenant">
          <x-request
            ref="request"
            :service="quotaService"
            :params="params"
            :processor="resolver"
          >
            <hard-quota
              v-model="model.resource"
              style="width: 700px;margin-top:20px"
              :availables="model.availables"
            />
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
  </kube-pipe>
</template>

<script>
import {
    // toPlainObject as toResourceQuotaPlainObject,
    toK8SObject as toResourceQuotaPK8SObject,
} from 'kubecube/k8s-resources/resourceQuota/index.js';

import {
    toPlainObject as toCubeResourceQoutaPlainObject,
} from 'kubecube/k8s-resources/cubeResourceQuota/index.js';
import {
    toK8SObject as toSubnamespaceK8SObject,
} from 'kubecube/k8s-resources/subnamespace';

import clusterSelect from '../namespace/cluster-select.vue';
import kubeTenantSelect from 'kubecube/component/global/common/kube-tenant-select.vue';
import kubeProjectSelect from 'kubecube/component/global/common/kube-project-select.vue';
import scopeService from 'kubecube/services/scope';
// import clusterService from 'kubecube/services/cluster';
import workloadService from 'kubecube/services/k8s-resource';
import hardQuota from '../namespace/ns-quota-table.vue';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

export default {
    components: {
        clusterSelect,
        kubeTenantSelect,
        kubeProjectSelect,
        hardQuota,
    },
    mixins: [ makeVModelMixin ],
    data() {
        return {
            quotaService: scopeService.getCubeQuotaResourceInstance,
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
    methods: {
        resolver(cubeQuotaResponse) {
            // this.type = response ? 'edit' : 'create';
            const quota = toCubeResourceQoutaPlainObject(cubeQuotaResponse);
            Object.assign(this.model.availables, {
                cpu: quota.status.hard.cpu - quota.status.used.cpu + this.model.resource.spec.hard.cpu, // - unitConvertCPU(clusterQuota.assignedCpu),
                memory: quota.status.hard.memory - quota.status.used.memory + this.model.resource.spec.hard.memory, // - unitConvertMemory(clusterQuota.assignedMem),
                gpu: quota.status.hard.gpu - quota.status.used.gpu + this.model.resource.spec.hard.gpu, // - unitConvertCPU(clusterQuota.assignedGpu),
                // storage: item.totalStorage - item.usedStorage,
            });
        },
        async submit() {
            const {
                cluster, namespace, tenant, project,
            } = this.model.pipe;

            const subnamespaceyaml = toSubnamespaceK8SObject({
                namespace,
                tenant: tenant.value,
                project: project.value,
                scope: project.spec.namespace,
            });

            const quota = toResourceQuotaPK8SObject(
                {
                    cluster: cluster.value,
                    namespace,
                    tenant: tenant.value,
                    project: project.value,
                },
                this.model.resource
            );

            await workloadService.createNamespaceCRResource({
                pathParams: {
                    cluster: cluster.value,
                    group: 'hnc.x-k8s.io',
                    version: 'v1alpha2',
                    plural: 'subnamespaceanchors',
                    namespace: project.spec.namespace,
                },
                data: subnamespaceyaml,
            });

            await workloadService.createAPIV1Instance({
                pathParams: {
                    cluster: cluster.value,
                    namespace,
                    resource: 'resourcequotas',
                },
                data: quota,
            });

            this.$toast.success('创建成功');

        },
    },
};
</script>

<style>

</style>
