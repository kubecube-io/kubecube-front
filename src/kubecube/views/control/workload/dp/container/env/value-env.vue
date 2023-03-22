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
              dataIndex: 'value'
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
      <template v-slot:value="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixKey}.${index}.value`"
          :rules="[
            validators.consistofUnicode(false),
            validators.lengthBetween(0, 2048, false),
          ]"
        >
          <el-input
            v-model="record.value"
            placeholder="0-2048个 ASCII 字符组成"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
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
    data: () => ({
        validators,
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-value-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
            };
        },
    },
};
</script>

<style>

</style>
