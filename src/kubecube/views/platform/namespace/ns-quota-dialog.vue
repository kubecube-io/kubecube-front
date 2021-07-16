<template>
  <u-modal
    :title="type === 'create' ? '创建空间' : '修改空间'"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <kube-pipe
      graph="tenant > project"
      @pipestatechange="pipeLoading = $event"
    >
      <validation-observer
        ref="observer"
        v-slot="{ invalid }"
      >
        <kube-form ref="form">
          <validation-provider
            name="Cluster"
            rules="required"
          >
            <kube-form-item
              label="集群"
              required
            >
              <cluster-select

                v-model="pipe.cluster"
                :disabled="isEdit"
                no-title
                size="large"
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
                v-model="pipe.namespace"
                :disabled="isEdit"
                size="large"
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
                v-model="pipe.tenant"
                :disabled="isEdit"
                size="large"
              />
            </kube-form-item>
          </validation-provider>
          <validation-provider
            name="project"
            rules="required"
          >
            <kube-form-item
              label="关联项目"
            >
              <kube-project-select
                v-model="pipe.project"
                size="large"
                :disabled="isEdit"
                no-empty
                :tenant="pipe.tenant && pipe.tenant.value"
              />
            </kube-form-item>
          </validation-provider>

          <kube-form-item
            label="类型"
          >
            <u-text>共享</u-text>
          </kube-form-item>

          <template v-if="pipe.cluster && pipe.tenant && resourceLoaded">
            <x-request
              ref="request"
              :service="quotaService"
              :params="params"
              :processor="resolver"
            >
              <hard-quota
                v-model="resource"
                :availables="availables"
              />
            </x-request>
          </template>

          <u-submit-button
            :click="submit.bind(this)"
            place="right"
          >
            <template slot-scope="scope">
              <u-linear-layout>
                <u-button
                  color="primary"
                  :disabled="invalid || scope.submitting"
                  :icon="scope.submitting ? 'loading' : ''"
                  @click="scope.submit"
                >
                  确定
                </u-button>
                <u-button @click="close">
                  取消
                </u-button>
              </u-linear-layout>
            </template>
          </u-submit-button>
        </kube-form>
      </validation-observer>
    </kube-pipe>
  </u-modal>
</template>

<script>
import { pick } from 'lodash';
import BigNumber from 'bignumber.js';
import { Modal } from '@micro-app/common/mixins';
import {
    toPlainObject as toResourceQuotaPlainObject,
    toK8SObject as toResourceQuotaPK8SObject,
    patchK8SObject as patchResourceQuotaPK8SObject,
} from 'kubecube/k8s-resources/resourceQuota/index.js';

import {
    toPlainObject as toCubeResourceQoutaPlainObject,
} from 'kubecube/k8s-resources/cubeResourceQuota/index.js';

import clusterSelect from './cluster-select.vue';
import kubeTenantSelect from 'kubecube/component/global/common/kube-tenant-select.vue';
import kubeProjectSelect from 'kubecube/component/global/common/kube-project-select.vue';
import scopeService from 'kubecube/services/scope';
// import clusterService from 'kubecube/services/cluster';
import workloadService from 'kubecube/services/k8s-resource';
import userService from 'kubecube/services/user';
import hardQuota from './ns-quota-table.vue';
// import storageQuota from '../quota/storage-quota-input.vue';
import {
    toK8SObject as toSubnamespaceK8SObject,
} from 'kubecube/k8s-resources/subnamespace';

export default {
    components: {
        clusterSelect,
        kubeTenantSelect,
        kubeProjectSelect,
        hardQuota,
        // storageQuota,
    },
    mixins: [ Modal ],
    props: {
        tenant: Object,
    },

    data() {
        return {
            // item: {},
            quotaService: scopeService.getCubeQuotaResourceInstance,
            resource: toResourceQuotaPlainObject(),
            resourceLoaded: false,
            type: 'create',
            availables: {
                cpu: 0,
                memory: 0,
                gpu: 0,
            },

            pipe: {
                namespace: '',
                cluster: null,
                tenant: this.tenant ? pick(this.tenant, [ 'value' ]) : null,
                project: null,
            },
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
        params() {
            return {
                pathParams: {
                    name: `${this.pipe.cluster.value}.${this.pipe.tenant.value}`,
                },
            };
        },
        // availables() {
        //     const item = this.pipe.cluster;
        //     return {
        //         cpu: item.totalCpu - item.usedCpu,
        //         memory: item.totalMem - item.usedMem,
        //         gpu: item.totalGpu - item.usedGpu,
        //         storage: item.totalStorage - item.usedStorage,
        //     };
        // },
    },
    watch: {
        tenant(val) {
            this.pipe.tenant = val ? pick(val, [ 'value' ]) : null;
        },
    },
    methods: {
        resolver(cubeQuotaResponse) {
            // this.type = response ? 'edit' : 'create';
            const quota = toCubeResourceQoutaPlainObject(cubeQuotaResponse);
            Object.assign(this.availables, {
                cpu: +new BigNumber(quota.status.hard.cpu).minus(quota.status.used.cpu).plus(this.resource.spec.hard.cpu), // - unitConvertCPU(clusterQuota.assignedCpu),
                memory: +new BigNumber(quota.status.hard.memory).minus(quota.status.used.memory).plus(this.resource.spec.hard.memory), // - unitConvertMemory(clusterQuota.assignedMem),
                gpu: +new BigNumber(quota.status.hard.gpu).minus(quota.status.used.gpu).plus(this.resource.spec.hard.gpu), // - unitConvertCPU(clusterQuota.assignedGpu),
                // storage: item.totalStorage - item.usedStorage,
            });
        },
        async open(item) {
            this.show = true;
            this.resourceLoaded = false;
            if (item) {
                Object.assign(this.pipe, {
                    namespace: item.namespace,
                    cluster: { value: item.cluster },
                    project: { value: item.project },
                });

                const response = await workloadService.getAPIV1Instance({
                    pathParams: {
                        cluster: item.cluster,
                        namespace: item.namespace,
                        resource: 'resourcequotas',
                        name: `${item.cluster}.${this.tenant.value}.${item.project}.${item.namespace}`,
                    },
                });
                this.resource = toResourceQuotaPlainObject(response);
                this.resourceLoaded = true;
                this.type = 'edit';

            } else {
                this.resource = toResourceQuotaPlainObject();
                this.pipe.namespace = '';
                this.resourceLoaded = true;
                this.type = 'create';
            }

        },
        async submit() {
            const {
                cluster, namespace, tenant, project,
            } = this.pipe;
            if (this.type === 'edit') {
                const quota = patchResourceQuotaPK8SObject(
                    this.resource
                );
                await workloadService.patchAPIV1Instance({
                    pathParams: {
                        cluster: cluster.value,
                        namespace,
                        resource: 'resourcequotas',
                        name: `${cluster.value}.${tenant.value}.${project.value}.${namespace}`,
                    },
                    data: quota,
                });
                this.show = false;
                this.$emit('refresh', tenant.value);
            } else {
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
                    this.resource
                );

                await userService.createNSQuota({
                    data: {
                        cluster: cluster.value,
                        subNamespaceAnchor: subnamespaceyaml,
                        resourceQuota: quota,
                    },
                });

                // await workloadService.createNamespaceCRResource({
                //     pathParams: {
                //         cluster: cluster.value,
                //         group: 'hnc.x-k8s.io',
                //         version: 'v1alpha2',
                //         plural: 'subnamespaceanchors',
                //         namespace: project.spec.namespace,
                //     },
                //     data: subnamespaceyaml,
                // });

                // await workloadService.createAPIV1Instance({
                //     pathParams: {
                //         cluster: cluster.value,
                //         namespace,
                //         resource: 'resourcequotas',
                //     },
                //     data: quota,
                // });

                this.show = false;
                this.$emit('refresh', this.pipe.tenant.value);
            }


        },
    },
};
</script>

<style module>
.table td,
.table th{
    text-align: center;
}
.table td:nth-child(3n+1),
.table th:nth-child(3n+1){
    text-align: left;
}
.thead{
    background-color: #f5f7fa;
    background-clip: padding-box;
    border-bottom: 1px solid #ebf0f5;
}
tr.thead > th {
    vertical-align: middle;
    box-sizing: border-box;
    padding: 13px 10px;
    line-height: 20px;
    text-align: left;
    font-weight: 400;
}
.inlineflex {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}
.inlineflex > * {
    margin-left: .75em;
}
.required{
    position: relative;
}
.required::after {
    content: '*';
    color: red;
    position: absolute;
    right: -.5em;
    height: 12px;
    line-height: 12px;
    top: 0px;
}
.unit {
    width: 40px;
}
.inputs {
    width: 120px;
    float:right
}

</style>
