<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: '节点路径',
              dataIndex: 'path',
          },
          {
              title: '模式',
              dataIndex: 'pathType'
          },
          {
              title: '挂载目录',
              dataIndex: 'mountPath'
          }
      ]"
    >
      <template v-slot:path="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.path`"
          :rules="[
            validators.startsWithSlash(false),
            validators.consistofPath(false),
          ]"
        >
          <el-input
            v-model="record.path"
          />
        </el-form-item>
      </template>
      <template v-slot:pathType="{record}">
        <el-select v-model="record.pathType" placeholder="请选择" filterable>
          <el-option
            v-for="item in pathTypeList"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-slot:mountPath="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.mountPath`"
          :rules="[
            validators.startsWithSlash(false),
            validators.consistofPath(false),
            validators.noRedundance(allMountPath, false)
          ]"
        >
          <el-input
            v-model="record.mountPath"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data: () => ({
        validators,
        resource: 'hostpath',
        pathTypeList: [
            { text: 'DirectoryOrCreate', value: 'DirectoryOrCreate' },
            { text: 'FileOrCreate', value: 'FileOrCreate' },
        ],
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-hostpath-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
                mountPath: '',
                pathType: 'DirectoryOrCreate',
            };
        },
    },
};
</script>

<style>

</style>
