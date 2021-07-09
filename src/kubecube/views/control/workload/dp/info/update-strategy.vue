<template>
  <kube-form-item
    label="更新策略"
    layout="block"
  >
    <kube-form label-size="large">
      <validation-provider
        v-slot="{ errors }"
        name="strategy-minReadySeconds"
        :rules="{
          ConsistofNumber: true,
          NumberBetween: {min: 5, max: 300}
        }"
      >
        <kube-form-item
          label="最短就绪时间"
          :message="errors && errors[0]"
        >
          <span slot="label">
            <u-note>
              最短就绪时间：新创建的副本准备就绪后，被视为可用前需要保持正常的时间下限，单位（秒）
            </u-note>
          </span>

          <u-input
            v-model="model.minReadySeconds"
            size="huge normal"
            maxlength="3"
            :color="errors && errors[0] ? 'error' : ''"
            placeholder="请填入5-300的整数"
          />
        </kube-form-item>
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        name="strategy-maxSurge"
        rules="ConsistofNumberOrPercentage"
      >
        <kube-form-item
          label="最大超预期副本数"
          :message="errors && errors[0]"
        >
          <span slot="label">
            <u-note>
              最大超预期副本数：可创建的最大超过所需副本的副本数量或百分比
            </u-note>
          </span>

          <u-input
            v-model="model.maxSurge"
            size="huge normal"
            :color="errors && errors[0] ? 'error' : ''"
            placeholder="填写百分比或整数"
          />
        </kube-form-item>
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        name="strategy-maxUnavailable"
        rules="ConsistofNumberOrPercentage"
      >
        <kube-form-item
          label="最大不可用副本数"
          :message="errors && errors[0]"
        >
          <span slot="label">
            <u-note>
              最大不可用副本数：更新过程中不可使用的副本数上限个数或百分比
            </u-note>
          </span>

          <u-input
            v-model="model.maxUnavailable"
            size="huge normal"
            :color="errors && errors[0] ? 'error' : ''"
            placeholder="填写百分比或整数"
          />
        </kube-form-item>
      </validation-provider>
    </kube-form>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

export default {
    mixins: [ makeVModelMixin ],

};
</script>

<style>

</style>
