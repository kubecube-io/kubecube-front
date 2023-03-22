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
              title: 'Resource',
              dataIndex: 'resource',
          },
          {
              title: 'ResourceKey',
              dataIndex: 'resoueceKey'
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
      <template v-slot:resource="{record}">
        <el-select v-model="record.resource" placeholder="请选择" filterable>
          <el-option
            v-for="item in containerNames"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-slot:resoueceKey="{record}">
        <el-select v-model="record.resoueceKey" placeholder="请选择">
          <el-option
            v-for="item in RESOURCE_DATA"
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
import { RESOURCE_DATA } from 'kubecube/utils/constance';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ envMixin ],
    props: {
        containers: Array,
        existKeys: {
            type: Array,
            default: () => [],
        },
    },
    data: () => ({
        validators,
        RESOURCE_DATA: RESOURCE_DATA.map(k => ({ text: k, value: k })),
    }),
    computed: {
        containerNames() {
            return this.containers.filter(c => c.containerName).map(c => ({
                text: c.containerName,
                value: c.containerName,
            }));
        },
        errorprefix() {
            return `${this.prefixKey}-env-resource-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                resource: '',
                resoueceKey: '',
            };
        },
    },
};
</script>

<style>

</style>
