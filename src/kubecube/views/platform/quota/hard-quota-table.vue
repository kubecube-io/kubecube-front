<template>
  <kube-form-item
    label="共享资源"
    layout="block"
    required
  >
    <table-layout
      :class="$style.table"
      :show-button="false"
      style="width: 100%"
    >
      <template slot="head">
        <tr :class="$style.thead">
          <th width="50%">
            配额
          </th>
          <th width="25%">
            集群可分配
          </th>
          <th width="25%">
            租户已分配
          </th>
        </tr>
      </template>
      <template slot="body">
        <tr>
          <td>
            <div :class="$style.inlineflex">
              <u-text :class="$style.required">
                CPU
              </u-text>
              <validation-provider
                v-slot="{ errors }"
                style="flex: 1"
                name="cpu"
                :rules="{
                  required: true,
                  ConsistofFloatNumber: true,
                  NumberBetween: { min: 0, max: availables.cpu },
                }"
              >
                <kube-form-item
                  muted="no"
                  :class="$style.inputs"
                  field-size="full"
                  layout="none"
                  :message="errors && errors[0]"
                  placement="bottom"
                  required
                >
                  <u-input
                    v-model="model.spec.hard['requests.cpu']"
                    style="width: 100%"
                    size="normal"
                  />
                </kube-form-item>
              </validation-provider>
              <u-text :class="$style.unit">
                Cores
              </u-text>
            </div>
          </td>
          <td>
            {{ availableCPU }}  Cores
          </td>
          <td>
            {{ item.usedCpu }} Cores
          </td>
        </tr>
        <tr>
          <td>
            <div :class="$style.inlineflex">
              <u-text :class="$style.required">
                内存
              </u-text>
              <validation-provider
                v-slot="{ errors }"
                style="flex: 1"
                name="memory"
                :rules="{
                  required: true,
                  ConsistofNumber: true,
                  NumberBetween: { min: 0, max: availables.memory },
                }"
              >
                <kube-form-item
                  muted="no"
                  :class="$style.inputs"
                  field-size="full"
                  layout="none"
                  :message="errors && errors[0]"
                  placement="bottom"
                  required
                >
                  <u-input
                    v-model="model.spec.hard['requests.memory']"
                    style="width: 100%"
                    size="normal"
                  />
                </kube-form-item>
              </validation-provider>
              <u-text :class="$style.unit">
                Mi
              </u-text>
            </div>
          </td>
          <td>
            {{ availableMemory }} Mi
          </td>
          <td>
            {{ item.usedMemory }} Mi
          </td>
        </tr>
        <tr>
          <td>
            <div :class="$style.inlineflex">
              <u-text>
                GPU
              </u-text>
              <validation-provider
                v-slot="{ errors }"
                style="flex: 1"
                name="gpu"
                :rules="{
                  ConsistofNumber: true,
                  NumberBetween: { min: 0, max: availables.gpu },
                }"
              >
                <kube-form-item
                  muted="no"
                  :class="$style.inputs"
                  field-size="full"
                  layout="none"
                  :message="errors && errors[0]"
                  placement="bottom"
                  required
                >
                  <u-input
                    v-model="model.spec.hard['requests.nvidia.com/gpu']"
                    style="width: 100%"
                    size="normal"
                  />
                </kube-form-item>
              </validation-provider>
              <u-text :class="$style.unit">
                Cores
              </u-text>
            </div>
          </td>
          <td>
            {{ availableGPU }} Cores
          </td>
          <td>
            {{ item.usedGpu }} Cores
          </td>
        </tr>
      </template>
    </table-layout>
  </kube-form-item>
</template>

<script>
import { toNumber } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import BigNumber from 'bignumber.js';
import tableLayout from 'kubecube/component/common/kube-dynamic-table-layout/index.vue';
export default {
    components: {
        'table-layout': tableLayout,
    },
    mixins: [ makeVModelMixin ],
    props: {
        availables: Object,
        item: Object,
    },
    computed: {
        availableCPU() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.cpu).minus(toNumber(this.model.spec.hard['requests.cpu'] || '0'))), this.availables.cpu);
        },
        availableMemory() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.memory).minus(toNumber(this.model.spec.hard['requests.memory'] || '0'))), this.availables.memory);
        },
        availableGPU() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.gpu).minus(toNumber(this.model.spec.hard['requests.nvidia.com/gpu'] || '0'))), this.availables.gpu);
        },
        // availableStorage() {
        //     return Math.min(Math.max(0, this.availables.storage - toNumber(this.model.spec.hard['requests.storage'] || '0')), this.availables.storage);
        // },
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
