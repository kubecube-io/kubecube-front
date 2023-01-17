<template>
  <dynamicBlock
    v-model="model"
    :get-default-item="getDataTemplate"
    :columns="[
      {
        title: '类型',
        dataIndex: 'type',
      },
      {
        title: 'Key',
        dataIndex: 'key',
      }
    ]"
  >
    <template #type="{ record }">
      <el-select
        v-model="record.type"
        placeholder="请选择"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.text"
          :value="item.value"
        />
      </el-select>
    </template>
    <template #key="{record, index}">
      <el-form-item
        :prop="`${prefixProp}.${index}.path`"
        :rules="[

        ]"
      >
        <el-input
          v-model="record.key"
          placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"
        />
      </el-form-item>
    </template>
  </dynamicBlock>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import * as validators from 'kubecube/utils/validators';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    props: {
        errorPrefix: String,
        rules: Object,
        prefixProp: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
            options: [
                { text: 'label', value: 'labels' },
                { text: 'env', value: 'env' },
                { text: 'annotation', value: 'annotations' },
            ],
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.path);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                type: '',
                key: '',
            };
        },
    },
};
</script>

<style>

</style>
