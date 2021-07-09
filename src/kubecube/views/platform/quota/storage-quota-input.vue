<template>
  <validation-provider
    v-slot="{ errors }"
    name="storage"
    :rules="{
      ConsistofNumber: true,
      NumberBetween: { min: 0, max: availables.storage },
    }"
  >
    <kube-form-item
      label="存储资源"
      :message="errors && errors[0]"
    >
      <u-input
        v-model="model.spec.hard['requests.storage']"
        size="normal"
      />
      <u-text> GiB</u-text>
    </kube-form-item>
  </validation-provider>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

export default {
    mixins: [ makeVModelMixin ],
    props: {
        availables: Object,
    },
};
</script>

<style>

</style>
