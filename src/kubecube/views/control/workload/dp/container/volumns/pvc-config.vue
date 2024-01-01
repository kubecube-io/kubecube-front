<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: '参数',
              dataIndex: 'resource',
          },
          {
              title: '挂载目录',
              dataIndex: 'mountPath'
          },
          {
              title: '子路径',
              dataIndex: 'subPath'
          }
      ]"
    >
      <template v-slot:resource="{record}">
        <el-select v-model="record.resource" placeholder="请选择" filterable>
          <el-option
            v-for="item in resources"
            :key="item.value"
            :label="item.text"
            :value="item.value">
            <el-tooltip class="item" effect="dark" content="pending中" placement="left" popper-class="ncs-el-tooltip-popper">
              <i class="el-icon-warning-outline" v-if="item.status.phase === 'Pending'" style="color: #FFA136"/>
            </el-tooltip>
            <span style="display:inline-block;padding-right:4px">
              {{item.text}}
            </span>
            <el-tag style="float: right;margin-top:5px" size="small">
              {{getFunc(item, 'spec.accessModes[0]') | accessModeFilter}}
            </el-tag>
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
      <template v-slot:subPath="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixKey}.${index}.subPath`"
          :rules="[
            validators.consistofSubPath(false)
          ]"
        >
          <el-input
            v-model="record.subPath"
            :disabled="!record.resource"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
    <div>
      如需新的存储声明，可
      <el-link
        type="primary"
        @click="openNewWindow({ path: '/control/persistentvolumeclaims/list', query: $route.query })"
      >
        创建存储声明
      </el-link>
      <i
        style="font-size:16px; margin-left: 8px"
        :class="loading ? 'el-icon-loading' : 'el-icon-refresh-right'"
        @click="update"
      />
    </div>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubecube/utils/validators';
import { get as getFunc } from 'lodash';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubecube/utils/constance';

export default {
    filters: {
        accessModeFilter(val) {
            return PVC_MODE_TEXT_MAP[val] || '-';
        },
    },
    mixins: [ makeVModelMixin, volumnMixin ],
    data: () => ({
        validators,
        resource: 'persistentvolumeclaims',
        getFunc,
    }),
    methods: {
        getDataTemplate() {
            return {
                resource: '',
                mountPath: '',
                subPath: '',
            };
        },
    },
};
</script>

<style>

</style>
