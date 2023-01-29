<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: 'Path',
              dataIndex: 'path',
          },
          {
              title: '服务',
              dataIndex: 'service',
          },
          {
              title: '端口',
              dataIndex: 'port',
          }
      ]"
    >
      <template v-slot:path="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixProp}.${index}.path`"
          :rules="[
            validators.required(),
            validators.startsWithSlash(false),
            validators.consistofPath(false),
            validators.noRedundance(exsitPaths, false)
          ]"
        >
          <el-input v-model="record.path" placeholder="请输入路径或者正则"/>
        </el-form-item>
      </template>
      <template v-slot:service="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixProp}.${index}.service`"
          :rules="[
            validators.required(),
            validators.noRedundance(exsitKeys, false)
          ]"
        >
          <el-select
            v-model="record.service"
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in serviceList"
              :key="item.value"
              :label="item.text"
              :value="item.value"
              :title="item.text"
            />
          </el-select>
        </el-form-item>
      </template>
      <template v-slot:port="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixProp}.${index}.port`"
          :rules="[
            validators.required(),
            validators.consistofNumber(false),
            validators.numberBetween(1, 65535, false),
          ]"
        >
          <el-input v-model="record.port" placeholder="1-65535内的整数"/>
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
        index: Number,
        defaultService: {
            type: String,
            default: '',
        },
        serviceList: Array,
        prefixProp: {
            type: String,
            default: ''
        },
    },
    data() {
      return {
        validators,
      }
    },
    computed: {
        exsitPaths() {
            return this.model.map(t => t.path);
        },
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
                service: this.defaultService,
                port: '',
            };
        },
    },
};
</script>

<style>

</style>
