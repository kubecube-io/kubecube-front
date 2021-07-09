<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form>
      <kube-form-item label="集群">
        {{ cluster }}
      </kube-form-item>
      <kube-form-item label="空间">
        {{ namespace }}
      </kube-form-item>
      <kube-name-input
        v-model="model.metadata.name"
        :disabled="isEdit"
      />
      <template v-if="workload === 'daemonsets'">
        <kube-form-item label="级别">
          <u-radios
            v-model="model.spec.level.ind"
            :disabled="isEdit"
          >
            <u-radio label="platform">
              平台级
            </u-radio>
            <u-radio label="tenant">
              租户级
            </u-radio>
          </u-radios>
        </kube-form-item>
        <tenant-select
          v-if="model.spec.level.ind === 'tenant'"
          v-model="model.spec.level.tenant"
          :disabled="isEdit"
        />
      </template>
      <kube-form-item
        v-if="!['cronjobs', 'jobs', 'daemonsets'].includes(workload)"
        label="副本数"
      >
        <u-number-input
          v-model="model.spec.replicas"
          style="width: 200px;"
          :min="0"
          size="huge normal"
        /> 个
      </kube-form-item>
      <template v-if="workload === 'statefulsets'">
        <validation-provider
          v-slot="{ errors }"
          name="serviceName"
          :rules="{
            required: true,
            startsWithLowercaseLetter: true,
            ConsistoLetterNumbersUnderscores: true,
            endsWithLowercaseLetterOrNumber: true,
          }"
        >
          <kube-form-item
            label="服务名"
            required
            v-bind="$attrs"
            :message="errors && errors[0]"
          >
            <slot />
            <u-input
              v-model="model.spec.serviceName"
              :disabled="isEdit"
              size="normal huge"
              maxlength="64"
              maxlength-message="不得超过 64 个字符"
              :color="errors && errors[0] ? 'error' : ''"
              placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"
            />
          </kube-form-item>
        </validation-provider>

        <storage-config v-model="model.spec.volumeClaimTemplates" />
      </template>
      <kube-form-item v-if="['deployments', 'daemonsets'].includes(workload)">
        <u-link @click="advanced = !advanced">
          {{ advanced ? '收起': '展开' }} 更多配置
        </u-link>
      </kube-form-item>
      <update-strategy
        v-if="advanced"
        v-model="model.spec.strategy"
      />
      <kube-form-item>
        <u-linear-layout direction="horizontal">
          <u-button
            color="primary"
            :disabled="invalid"
            @click="$emit('go', 1)"
          >
            下一步
          </u-button>
        </u-linear-layout>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

import updateStrategy from './update-strategy.vue';
import storageConfig from './storage-config.vue';
import tenantSelect from './tenant-select.vue';

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

};
</script>

<style>

</style>
