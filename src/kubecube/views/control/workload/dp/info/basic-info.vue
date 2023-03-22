<template>
  <div>
    <el-form ref="form" :model="model" :rules="rules" label-position="right" label-width="160px">
      <el-form-item label="集群">
        {{ cluster }}
      </el-form-item>
      <el-form-item label="空间">
        {{ namespace }}
      </el-form-item>
      <el-form-item label="名称" prop="metadata.name">
        <el-input v-model="model.metadata.name" :disabled="isEdit" placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"/>
      </el-form-item>
      <template v-if="workload === 'daemonsets'">
        <el-form-item label="级别">
          <el-radio-group v-model="model.spec.level.ind" :disabled="isEdit">
            <el-radio label="platform">平台级</el-radio>
            <el-radio label="tenant">租户级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="租户" v-if="model.spec.level.ind === 'tenant'" prop="spec.level.tenant">
          <tenant-select v-model="model.spec.level.tenant" :disabled="isEdit"/>
        </el-form-item>
      </template>
      <el-form-item label="副本数" v-if="!['cronjobs', 'jobs', 'daemonsets'].includes(workload)">
        <el-input-number v-model="model.spec.replicas" controls-position="right" :min="0" style="width: 300px;"/>
        <span style="margin-left:8px">个</span>
      </el-form-item>
      <template v-if="workload === 'statefulsets'">
        <el-form-item label="服务名" prop="spec.serviceName">
          <el-input v-model="model.spec.serviceName" :disabled="isEdit" placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"/>
        </el-form-item>
        <storage-config v-model="model.spec.volumeClaimTemplates" />
      </template>
      <el-form-item label="时区同步">
        <el-switch v-model="model.timeSync"/>
        <span style="margin-left:8px;color:#aaa">开启后容器与节点使用相同时区(时区同步功能依赖容器中挂载的本地磁盘，请勿修改删除)</span>
      </el-form-item>
      <el-form-item label="" v-if="['deployments', 'daemonsets'].includes(workload)">
        <el-link type="primary" @click="advanced = !advanced">
          {{ advanced ? '收起': '展开' }}更多配置
        </el-link>
      </el-form-item>
      <update-strategy
        v-if="['deployments', 'daemonsets'].includes(workload) && advanced"
        v-model="model.spec.strategy"
      />
      <el-form-item>
        <el-button type="primary" @click="handleNextStep">下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

import updateStrategy from './update-strategy.vue';
import storageConfig from './storage-config.vue';
import tenantSelect from './tenant-select.vue';
import * as validators from 'kubecube/utils/validators';

export default {
    components: {
        updateStrategy,
        storageConfig,
        tenantSelect,
    },
    mixins: [ makeVModelMixin ],
    data() {
        return {
            advanced: getFunc(this.value, 'spec.strategy.enable'),
            rules: {
                'metadata.name': [
                    { required: true, message: '名称不能为空', trigger: 'blur' },
                    validators.k8sResourceNameValidator(),
                ],
                'spec.serviceName': [
                    { required: true, message: '服务名不能为空', trigger: 'blur' },
                    validators.k8sResourceNameValidator(),
                ],
                'spec.level.tenant': [
                    { required: true, message: '租户不能为空', trigger: 'blur' },
                ],
                'spec.strategy.minReadySeconds': [
                    validators.consistofNumber(false),
                    validators.numberBetween(5, 300, false),
                ],
                'spec.strategy.maxSurge': [
                    validators.consistofNumberOrPercentage(false),
                ],
                'spec.strategy.maxUnavailable': [
                    validators.consistofNumberOrPercentage(false),
                ],
            },
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
    },
    methods: {
        handleValidate() {
            this.$refs.observer.validate();
        },
        async handleNextStep() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.$emit('go', 1);
        },
    },
};
</script>

<style module>
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubecube/assets/question.svg');
    cursor: pointer;
}

</style>
