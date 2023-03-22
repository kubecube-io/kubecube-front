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
          title: 'Configmap',
          dataIndex: 'configmap',
        },
        {
          title: 'ConfigmapKey',
          dataIndex: 'configmapKey'
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
      <template v-slot:configmap="{record}">
        <el-select v-model="record.configmap" placeholder="请选择" filterable @change="item.configmapKey = ''">
          <el-option
            v-for="item in resources"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-slot:configmapKey="{record}">
        <el-select v-model="record.configmapKey" placeholder="请选择" filterable>
          <el-option
            v-for="item in getKeys(record.configmap)"
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
        resource: 'configmaps',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-configmap-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                configmap: '',
                configmapKey: '',
            };
        },
    },
};
</script>

<style>

</style>
