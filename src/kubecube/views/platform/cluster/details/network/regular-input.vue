<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
        {
          title: 'Key',
          dataIndex: 'key',
        },
        {
          title: 'Operator',
          dataIndex: 'operator',
        },
        {
          title: 'Values',
          dataIndex: 'values',
        }
      ]"
    >
      <template v-slot:key="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixProp}.${index}.key`"
          :rules="[
            ...(isRequired ? [ validators.required() ] : []),
            validators.keyPattern(false),
            validators.noRedundance(exsitKeys, false),
          ]"
        >
          <el-input
            v-model="record.key"
          />
        </el-form-item>
      </template>
      <template v-slot:operator="{record}">
        <el-select
            v-model="record.operator"
        >
          <el-option
            v-for="item in OPERATORS"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
      </template>
      <template v-slot:values="{record, index}">
        <el-form-item
          v-if="!['Exists', 'DoesNotExist'].includes(record.operator)"
          label=""
          :prop="`${prefixProp}.${index}.values`"
          :rules="[
            ...(isRequired ? [ validators.required() ] : []),
            ...(record.operator === 'label' ? [ validators.labelValuePatten(false) ] : []),
            ...(['In', 'NotIn'].includes(record.operator) ? [ validators.multipartLabelValuePatten(/\s+/, false) ] : []),
          ]"
        >
          <el-input
            v-model="record.values"
            :placeholder="getPlaceholder(record.operator)"
          />
        </el-form-item>
        <div v-else>
          <el-input
            disabled
            placeholder="不需要填Values"
          />
        </div>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import { OPERATORS } from 'kubecube/utils/constance';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    components: {
        dynamicBlock,
    },
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
        includeLable: {
            type: Boolean,
            default: true,
        },
        prefixProp: {
            type: String,
            default: '',
        },
        isRequired: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            OPERATORS: this.includeLable ? OPERATORS : OPERATORS.slice(1),
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                operator: this.includeLable ? 'label' : 'In',
                values: '',
            };
        },
        getPlaceholder(operator) {
            return (this.OPERATORS.find(item => item.value === operator) || {}).placeholder || '';
        },
    },
};
</script>

<style>

</style>
