<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: '名称',
              dataIndex: 'resource',
          },
          {
              title: '权限',
              dataIndex: 'readOnly'
          },
          {
              title: '挂载目录',
              dataIndex: 'mountPath'
          }
      ]"
    >
      <template v-slot:resource="{record}">
        <el-select v-model="record.resource" placeholder="请选择" filterable>
            <el-option
              v-for="item in volumeResources"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
      </template>
      <template v-slot:readOnly="{record}">
        <el-select v-model="record.readOnly" placeholder="请选择" filterable>
          <el-option
            v-for="item in readOnlyList"
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
            :disabled="!record.resource"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
    <div>
      如需新的EmptyDir，可
      <el-link
        type="primary"
        @click="openDialog"
      >
        创建EmptyDir
      </el-link>
    </div>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    props: {
        podVolumes: Object,
        openDialog: Function,
    },
    data: () => ({
        validators,
        resource: 'emptydir',
        readOnlyList: [
            { text: 'ReadAndWrite', value: false },
            { text: 'Readonly', value: true },
        ],
    }),
    computed: {
        volumeResources() {
            return this.podVolumes.emptyDir.map(dir => ({
                text: dir.name,
                value: dir.name,
            }));
        },
        errorprefix() {
            return `${this.prefixKey}-volume-emptydir-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                resource: '',
                readOnly: false,
                mountPath: '',
            };
        },
    },
};
</script>

<style>

</style>
