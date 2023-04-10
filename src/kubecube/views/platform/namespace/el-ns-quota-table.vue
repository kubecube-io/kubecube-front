<template>
  <div>
    <dynamicBlock
      :value="[{}, {}, {}]"
      :initialAdd="true"
      :showDeleteBtn="false"
      :showAddBtn="false"
      :columns="[
        {
          title: '资源配额',
          dataIndex: 'resource',
          width: '20%',
        },
        {
          title: '请求',
          dataIndex: 'request',
          width: '40%',
        },
        {
          title: '上限',
          dataIndex: 'limit',
          width: '40%',
        },
      ]"
    >
      <template v-slot:resource="{index}">
        <div v-if="index === 0" style="margin-bottom:18px">CPU</div>
        <div v-if="index === 1" style="margin-bottom:18px">内存</div>
        <div v-if="index === 2" style="margin-bottom:18px">GPU</div>
      </template>
      <template v-slot:request="{index}">
        <!-- 请求 -->
        <el-form-item
          v-if="index === 0"
          :prop="`${prefixProp}.spec.hard.cpu`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.greateThen(0),
            validators.numberBetween(0, availables.cpu),
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="model.spec.hard['cpu']"/>
            <div :class="$style.unitBox">Cores</div>
          </div>
          <div :class="$style.availableText">可分配 {{ availableCPU }} / {{ availables.cpu }} Cores</div>
        </el-form-item>
        <el-form-item 
          v-if="index === 1"
          :prop="`${prefixProp}.requestsMemory`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.greateThen(0),
            validators.numberBetween(0, memoryTransform(availables.memory)),
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="requestsMemory"/>
            <el-select
               v-model="memoryUnit"
              :class="$style.unitSelect"
            >
              <el-option label="Mi" value="Mi"/>
              <el-option label="Gi" value="Gi"/>
            </el-select>
          </div>
          <div :class="$style.availableText">可分配 {{ memoryTransform(availableMemory) }} / {{ memoryTransform(availables.memory) }} {{memoryUnit}}</div>
        </el-form-item>
        <el-form-item
          v-if="index === 2"
          :prop="`${prefixProp}.spec.hard.gpu`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.numberBetween(0, availables.gpu),
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="model.spec.hard['gpu']"/>
            <div :class="$style.unitBox">颗</div>
          </div>
          <div :class="$style.availableText">可分配 {{ availableGPU }} / {{ availables.gpu }} 颗</div>
        </el-form-item>
      </template>
      <template v-slot:limit="{index}">
        <!-- 上限 -->
        <el-form-item
          v-if="index === 0"
          :prop="`${prefixProp}.spec.hard.limitsCpu`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.greateThen(0),
            validators.greateThenEqual(model.spec.hard['cpu'], '上限资源应大于等于请求资源'),
            validators.numberBetween(0, availables.limitsCpu)
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="model.spec.hard['limitsCpu']"/>
            <div :class="$style.unitBox">Cores</div>
          </div>
          <div :class="$style.availableText">可分配 {{ availableLimitsCPU }} / {{ availables.limitsCpu }} Cores</div>
        </el-form-item>
        <el-form-item
          v-if="index === 1"
          :prop="`${prefixProp}.limitsMemory`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.greateThen(0),
            validators.greateThenEqual(requestsMemory, '上限资源应大于等于请求资源'),
            validators.numberBetween(0, memoryTransform(availables.limitsMemory))
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="limitsMemory"/>
            <el-select
               v-model="memoryUnit"
              :class="$style.unitSelect"
            >
              <el-option label="Mi" value="Mi"/>
              <el-option label="Gi" value="Gi"/>
            </el-select>
          </div>
          <div :class="$style.availableText">可分配 {{ memoryTransform(availableLimitsMemory) }} / {{ memoryTransform(availables.limitsMemory) }} {{memoryUnit}}</div>
        </el-form-item>
        <div v-if="index === 2">
          -
        </div>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { toNumber } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import BigNumber from 'bignumber.js';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    inject: [ 'elForm' ],
    props: {
        availables: Object,
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            memoryUnit: 'Gi',
            validators,
        };
    },
    computed: {
        availableCPU() {
            // return Math.min(Math.max(0, +new BigNumber(this.availables.cpu).minus(toNumber(this.model.spec.hard.cpu || '0'))), this.availables.cpu);
            return Math.min(Math.max(0, +new BigNumber(this.availables.cpu).minus(toNumber(this.model.spec.hard.cpu || '0'))), this.availables.cpu);
        },
        availableLimitsCPU() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.limitsCpu).minus(toNumber(this.model.spec.hard.limitsCpu || '0'))), this.availables.limitsCpu);
        },
        availableMemory() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.memory).minus(toNumber(this.model.spec.hard.memory || '0'))), this.availables.memory);
        },
        availableLimitsMemory() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.limitsMemory).minus(toNumber(this.model.spec.hard.limitsMemory || '0'))), this.availables.limitsMemory);
        },
        availableGPU() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.gpu).minus(toNumber(this.model.spec.hard.gpu || '0'))), this.availables.gpu);
        },
        // availableStorage() {
        //     return Math.min(Math.max(0, this.availables.storage - parseInt(this.model.spec.hard['requests.storage'] || '0')), this.availables.storage);
        // },
        requestsMemory: {
            get() {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                const val = this.model.spec.hard['memory'];
                this.model.requestsMemory = val && /^[1-9][0-9]*$/.test(`${val}`) ? val / num : val;
                return this.model.requestsMemory;
            },
            set(val) {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                this.model.spec.hard['memory'] = val && /^[1-9][0-9]*$/.test(`${val}`) ? val * num : val
            },
        },
        limitsMemory: {
            get() {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                const val = this.model.spec.hard['limitsMemory'];
                this.model.limitsMemory = val && /^[1-9][0-9]*$/.test(`${val}`) ? val / num : val;
                return this.model.limitsMemory;
            },
            set(val) {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                this.model.spec.hard['limitsMemory'] = val && /^[1-9][0-9]*$/.test(`${val}`) ? val * num : val
            },
        },
    },
    mounted() {
        this.$watch('model.spec.hard', () => {
            this.$nextTick(() => {
                this.elForm && this.elForm.validate();
            });
        }, {
            deep: true,
        });
    },
    methods: {
        normalizeCore(d) {
            return d / 1000;
        },
        memoryTransform(val) {
            if (this.memoryUnit === 'Gi') {
                return (val / 1024).toFixed(2);
            }
            return val;
        },
    },
};
</script>

<style module>
.table td {
    position: relative;
    text-align: left;
    padding: 20px 1px 10px 10px;
}
.table th {
    position: relative;
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
/* .inlineflex > * {
    margin-left: .75em;
} */
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
    text-align: right;
}
.inputs {
    width: 120px;
    float:right
}
.availableText {
    font-size: 12px;
    line-height: 18px;
    text-align: right;
    width: 100%;
    color: rgba(0, 0, 0, .4);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

}
.inputBox{
  border-radius: 3px 0 0 3px;
  border-right: none;
}
/* .unitSelect {
  padding: 0 4px;
  width: 50px;
  border-radius: 0 3px 3px 0;
}
.unitSelect::after {
  display: none;
}
.unitSelect li {
  padding: 4px 4px;
} */
.unitInputWrap {
  display: flex;
  align-items: center;
}
.unitBox{
  width: 48px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 32px;
  line-height: 32px;
  padding: 0 4px;
  border: 1px solid #e5e5e5;
  border-left: none;
  border-radius: 0 2px 2px 0;
  background-color: #f5f5f5;
  cursor: default;
}
.unitSelect {
   width: 48px !important;
   flex-grow: 0;
   flex-shrink: 0;
}
.unitSelect :global(.el-input__icon){
  display: none;
}
.unitSelect :global(.el-input__inner){
  padding: 0 4px;
  border-left: none;
}
</style>
