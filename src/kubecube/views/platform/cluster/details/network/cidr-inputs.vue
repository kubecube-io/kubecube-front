<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
        {
          title: '例外 CIDR',
          dataIndex: 'cidr',
        },
      ]"
      :disabled="disabled"
    >
      <template v-slot:cidr="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.cidr`"
          :rules="[
            validators.cidr(false),
            validators.noRedundance(exsitKeys, false),
          ]"
        >
          <el-input
            v-model="record.cidr"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import * as validators from 'kubecube/utils/validators';
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    props: {
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
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.cidr);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                cidr: '',
            };
        },
    },
};
</script>

<style>

</style>
