<template>
  <kube-form-item
    layout="block"
    label="部署策略"
  >
    <u-switch
      v-model="model.enable"
      width="wide"
      :with-text="true"
    />

    <kube-form
      v-if="model.enable"
      label-size="small"
    >
      <affinity-config
        v-model="model.nodeAffinity"
        type="nodeAffinity"
      />
      <affinity-config
        v-model="model.podAffinity"
        type="podAffinity"
      />
      <affinity-config
        v-model="model.podAntiAffinity"
        type="podAntiAffinity"
      />
      <toleration-config
        v-model="model.tolerations"
      />
    </kube-form>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import affinityConfig from './affinity-config.vue';
import tolerationConfig from './toleration-config.vue';
export default {
    components: {
        affinityConfig,
        tolerationConfig,
    },
    mixins: [ makeVModelMixin ],
};
</script>

<style>

</style>
