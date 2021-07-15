<template>
  <u-modal
    title="调整配额"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <template v-if="item.clusterName">
      <x-request
        ref="request"
        :service="quotaService"
        :params="params"
        :processor="resolver"
      >
        <validation-observer
          ref="observer"
          v-slot="{ invalid }"
        >
          <kube-form ref="form">
            <kube-form-item
              label="集群"
            >
              {{ item.clusterName }}
            </kube-form-item>
            <hard-quota
              v-model="model"
              :item="used"
              :availables="availables"
            />

            <!-- <storage-quota
              v-model="model"
              :availables="availables"
            /> -->

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
      </x-request>
    </template>
  </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/mixins';
import BigNumber from 'bignumber.js';
import {
    toPlainObject as toCubeResourceQoutaPlainObject,
    toK8SObject as toCubeResourceQoutaK8SObject,
    patchK8SObject as patchCubeResourceQoutaK8SObject,
} from 'kubecube/k8s-resources/cubeResourceQuota/index.js';
import {
    unitConvertMemory,
    unitConvertCPU,
} from 'kubecube/utils/functional';
import scopeService from 'kubecube/services/scope';
import clusterService from 'kubecube/services/cluster';
import hardQuota from './hard-quota-table.vue';
// import storageQuota from './storage-quota-input.vue';

export default {
    components: {
        // storageQuota,
        hardQuota,
    },
    mixins: [ Modal ],
    props: {
        tenant: Object,
    },
    data() {
        return {
            item: {},
            used: {},
            // quotaService: scopeService.getCubeQuotaResourceInstance,
            model: toCubeResourceQoutaPlainObject(),
            availables: {},
            type: 'create',
        };
    },
    computed: {
        params() {
            return {
                pathParams: {
                    name: `${this.item.clusterName}.${this.tenant.value}`,
                },
            };
        },
    },
    methods: {
        async quotaService() {
            return await Promise.all([
                scopeService.getCubeQuotaResourceInstance(this.params),
                clusterService.getClusterQuata({
                    params: {
                        cluster: this.item.clusterName,
                    },
                }),
            ]);
        },
        resolver([ cubeQuotaResponse, clusterQuota ]) {
            this.type = cubeQuotaResponse ? 'edit' : 'create';
            this.model = toCubeResourceQoutaPlainObject(cubeQuotaResponse);
            this.used = {
                usedCpu: this.model.status.used.cpu,
                usedMemory: this.model.status.used.memory,
                usedGpu: this.model.status.used.gpu,
            };
            this.availables = {
                cpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityCpu)).minus(unitConvertCPU(clusterQuota.assignedCpu)),
                memory: +new BigNumber(unitConvertMemory(clusterQuota.capacityMem)).minus(unitConvertMemory(clusterQuota.assignedMem)),
                gpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityGpu)).minus(unitConvertCPU(clusterQuota.assignedGpu)),
                // storage: item.totalStorage - item.usedStorage,
            };
        },
        open(item) {
            this.show = true;
            this.item = item;
        },
        async submit() {
            if (this.type === 'edit') {
                const data = patchCubeResourceQoutaK8SObject(this.model, this.tenant.value, this.item.clusterName);
                await scopeService.patchKubeDefineResource({
                    pathParams: {
                        name: this.model.metadata.name,
                    },
                    data,
                });
                this.show = false;
                this.$emit('refresh');
            } else {
                const data = toCubeResourceQoutaK8SObject(this.model, this.tenant.value, this.item.clusterName);
                await scopeService.createCubeQuotaResource({
                    data,
                });
                this.show = false;
                this.$emit('refresh');
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
