<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :disabled="disabled"
      :columns="[
        {
          title: '端口',
          dataIndex: 'port',
        },
        {
          title: '协议',
          dataIndex: 'protocol',
        }
      ]"
    >
      <template v-slot:port="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixProp}.${index}.port`"
          :rules="[
            validators.consistofNumber(false),
            validators.numberBetween(1, 65535, false),
            validators.enhanceNoRedundance(exsitKeys, `${record.protocol}-${record.port}`, false),
          ]"
        >
          <el-input
            v-model="record.port"
          />
        </el-form-item>
      </template>
      <template v-slot:protocol="{record}">
        <el-select
          v-model="record.protocol"
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in protocols"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    props: {
        selectKeys: Array,
        prefixKey: {
            type: String,
            default: '',
        },
        disabled: Boolean,
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            protocols: [
                { text: 'TCP', value: 'TCP' },
                { text: 'UDP', value: 'UDP' },
            ],
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => `${t.protocol}-${t.port}`);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                port: '',
                protocol: 'TCP',
            };
        },
    },
};
</script>

<style>

</style>
