<template>
  <el-dialog
    title="调整配额"
    :visible.sync="show"
    width="1000px"
    :close-on-click-modal="false"
  >
    <template v-if="item.clusterName">
      <x-request
        ref="request"
        :service="quotaService"
        :params="params"
        :processor="resolver"
      >
        <el-form ref="form" :model="model" label-position="right" label-width="120px">
          <el-form-item label="集群名称">
            {{ item.clusterDisplayName }}
          </el-form-item>
          <el-form-item label="集群标识">
            {{ item.clusterName }}
          </el-form-item>
          <el-form-item label="共享资源">
            <hardQuota
              v-model="model"
              :item="used"
              :availables="availables"
            />
          </el-form-item>
          <el-form-item
            label="存储资源"
            prop="spec.hard.requestsStorage"
            :rules="[
              validators.required(),
              validators.consistofNumber(),
              validators.numberBetween(0),
              validators.lengthBetween(1, 12),
            ]"
          >
            <el-input v-model="model.spec.hard['requestsStorage']" style="width: 300px"/>
            <span style="line-height:32px;margin-left:8px">GiB</span>
          </el-form-item>
        </el-form>
      </x-request>
    </template>
    <div slot="footer">
      <el-button @click="show = false">取 消</el-button>
      <el-button type="primary" @click="submit" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
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
import hardQuota from './el-hard-quota-table.vue';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toNodePlainObject,
} from 'kubecube/k8s-resources/node';
import { getNodeInfo } from 'kubecube/utils/functional';
import { get } from 'vuex-pathify';
import * as validators from 'kubecube/utils/validators';

export default {
    components: {
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
            model: toCubeResourceQoutaPlainObject(),
            availables: {},
            type: 'create',
            // usedNodes: [],
            // remainNodes: [],
            // allNodes: [],
            // selectedNodes: [],
            validators,
            submitLoading: false,
        };
    },
    computed: {
        params() {
            return {
                pathParams: {
                    cluster: this.controlClusterList[0].clusterName,
                    name: `${this.item.clusterName}.${this.item.tenant}`,
                },
            };
        },
        controlClusterList: get('scope/controlClusterList'),
    },
    methods: {
        handleValidate() {
            this.$refs.observer.validate();
        },
        async quotaService() {
            return await Promise.all([
                scopeService.getCubeQuotaResourceInstance(this.params),
                clusterService.getClusterQuata({
                    params: {
                        cluster: this.item.clusterName,
                        // nodeLabelSelector: 'node.kubecube.io/tenant=share',
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
                usedLimitsCpu: this.model.status.used.limitsCpu,
                usedLimitsMemory: this.model.status.used.limitsMemory,
            };
            this.availables = {
                cpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityCpu)).minus(unitConvertCPU(clusterQuota.assignedCpu)).plus(this.model.status.hard.cpu),
                memory: +new BigNumber(unitConvertMemory(clusterQuota.capacityMem)).minus(unitConvertMemory(clusterQuota.assignedMem)).plus(this.model.status.hard.memory),
                gpu: +new BigNumber(unitConvertCPU(clusterQuota.capacityGpu)).minus(unitConvertCPU(clusterQuota.assignedGpu)).plus(this.model.status.hard.gpu),
                storage: Infinity,
            };
        },
        open(item) {
            this.show = true;
            this.item = item;
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
                if (this.type === 'edit') {
                    const data = patchCubeResourceQoutaK8SObject(this.model, this.item.tenant, this.item.clusterName);
                    await scopeService.patchKubeDefineResource({
                        pathParams: {
                            cluster: this.controlClusterList[0].clusterName,
                            name: this.model.metadata.name,
                        },
                        data,
                    });
                    this.show = false;
                    this.$emit('refresh');
                } else {
                    const data = toCubeResourceQoutaK8SObject(this.model, this.item.tenant, this.item.clusterName);
                    await scopeService.createCubeQuotaResource({
                        data,
                    });
                    this.show = false;
                    this.$emit('refresh');
                }
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;

        },
    },
};
</script>

<style module>
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubecube/assets/question.svg');
    cursor: pointer;
}
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
.adjustTransfer ul[class] {
    width: 310px;
    overflow: auto;
}
.adjustTransfer ul[class] li[disabled] {
    color: #999;
}
.nodes {
    margin-bottom: 5px;
}
.nodes div {
    display: inline-block;
    width: 310px;
}
.nodes div:first-child {
    margin-right: 54px;
    vertical-align: top;
}
.transferWrap :global(.el-transfer-panel) {
  width: 350px;
}
</style>
