<template>
  <kube-form-item
    label="任务设定"
    layout="block"
  >
    <kube-form style="width: 750px">
      <kube-form-item
        layout="block"
        label="预期成功执行数"
        description="任务达到执行完成状态需要成功执行的 Pod 数量"
      >
        <u-number-input
          v-model="model.completions"
          :min="1"
        />
      </kube-form-item>
      <kube-form-item
        layout="block"
        label="并行数"
        description="任务执行过程中允许同时创建的最大 Pod 数,并行数应不大于执行次数"
      >
        <u-number-input
          v-model="model.parallelism"
          :min="1"
        />
      </kube-form-item>
      <validation-provider
        v-slot="{ errors }"
        name="job-activeDeadlineSeconds"
        rules="ConsistofNumber"
      >
        <kube-form-item
          :message="errors && errors[0]"
          name="activeDeadlineSeconds"
          label="超时时间"
          layout="block"
          description="任务执行超出该时间时，任务将会被标识为执行失败，任务负载下的所有 Pod 实例都会被删除。为空时表示不设置超时时间。"
        >
          <u-input
            v-model="model.activeDeadlineSeconds"
            :color="errors && errors[0] ? 'error' : ''"
          /> 秒
        </kube-form-item>
      </validation-provider>
      <kube-form-item label="重试次数">
        <u-number-input
          v-model="model.backoffLimit"
          :min="1"
        />
      </kube-form-item>
    </kube-form>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
};
</script>

<style>

</style>
