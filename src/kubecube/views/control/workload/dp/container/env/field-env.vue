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
              title: 'Value',
              dataIndex: 'field',
          },
      ]"
    >
      <template v-slot:key="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.key`"
          :rules="[
            validators.startsWithLetter(false),
            validators.consistofLetterNumbersUnderscores(false),
            validators.noRedundance(existKeys, false),
            validators.lengthBetween(1, 64, false),
          ]"
        >
          <el-input
            v-model="record.key"
            placeholder="1-64位字母、数字或下划线组成，以字母开头"
          />
        </el-form-item>
      </template>
      <template v-slot:field="{record}">
        <el-select v-model="record.field" placeholder="请选择" filterable>
          <el-option
            v-for="item in FIELD_DATA"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { FIELD_DATA } from 'kubecube/utils/constance';
import envMixin from './env.mixin';
import * as validators from 'kubecube/utils/validators';

export default {
    mixins: [ envMixin ],
    props: {
        existKeys: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            validators,
            FIELD_DATA: FIELD_DATA.map(k => ({ text: k, value: k })),
        };
    },
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-field-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                field: '',
            };
        },
    },
};
</script>

<style>

</style>
