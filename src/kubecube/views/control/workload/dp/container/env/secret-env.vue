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
              title: 'Secret',
              dataIndex: 'secret',
          },
          {
              title: 'SecretKey',
              dataIndex: 'secretKey'
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
      <template v-slot:secret="{record}">
        <el-select v-model="record.secret" placeholder="请选择" filterable>
          <el-option
            v-for="item in opaqueResources"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-slot:secretKey="{record}">
        <el-select v-model="record.secretKey" placeholder="请选择" filterable>
          <el-option
            v-for="item in getKeys(record.secret)"
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
// import { keys } from 'lodash';
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
        resource: 'secrets',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-secrets-`;
        },
        opaqueResources() {
            return (this.resources || []).filter(i => i.type === 'Opaque');
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                secret: '',
                secretKey: '',
            };
        },
        // getKeys(value) {
        //     if (!value || !this.resources) return [];
        //     const items = keys(this.resources.find(r => r.value === value).data).map(k => ({
        //         text: k,
        //         value: k,
        //     }));
        //     return items;
        // },
    },
};
</script>

<style>

</style>
