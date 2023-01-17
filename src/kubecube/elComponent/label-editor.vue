<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'Key',
          dataIndex: 'key',
        },
        {
          title: 'Value',
          dataIndex: 'value',
        }
      ]"
      :disabled="disabled"
    >
      <template slot="th-key">
        Key
        <el-tooltip
          effect="dark"
          placement="right"
        >
          <template slot="content">
            <div>Key 分为前缀和后缀，以/分隔，可只写后缀。</div>
            <div>前缀: 0-253位小写字母、数字、"-"、"."组成，以字母或数字开头、结尾，"."之前需为字母或数字。</div>
            <div>后缀: 1-63位字母、数字、"-"、"_"或"."组成，以字母或数字开头、结尾。</div>
          </template>
          <i class="el-icon-question" />
        </el-tooltip>
      </template>
      <template #key="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.key`"
          :rules="[
            validators.lengthBetween(1, 63, false),
            validators.keyPattern(false),
            validators.noRedundance(exsitKeys, false),
            ...(!noSystemKeyRule && !record.disabled ? [ validators.noSystemKey(false) ] : []),
            ...(required ? [{ required: true, message: '不能为空'}] : [])
          ]"
        >
          <el-select
            v-if="selectKeys"
            v-model="record.key"
            :disabled="disabled || record.disabled || record.disabledKey"
            placeholder="请选择"
            filterable
            allow-create
          >
            <el-option
              v-for="item in selectKeys"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-else
            v-model="record.key"
            :disabled="disabled || record.disabled || record.disabledKey"
          />
        </el-form-item>
      </template>
      <template #value="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.value`"
          :rules="[
            ...(!!record.valueRequired ? [ validators.required() ] : []),
            ...(prefixKey === 'labels' ? [ validators.labelValuePatten(false) ] : []),
          ]"
        >
          <el-select
            v-if="record.selectValues"
            v-model="record.value"
            :disabled="disabled || record.disabled || record.disabledValue"
            placeholder="请选择"
            filterable
            :allow-create="record.allowCreate"
          >
            <el-option
              v-for="item in record.selectValues"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-else
            v-model="record.value"
            :disabled="disabled || record.disabled || record.disabledValue"
          />
        </el-form-item>
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
        required: {
            type: Boolean,
            default: false,
        },
        selectKeys: Array,
        prefixKey: {
            type: String,
            default: '',
        },
        noSystemKeyRule: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
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
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
                disabled: false,
            };
        },
    },
};
</script>

<style>

</style>
