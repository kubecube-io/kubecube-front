<template>
  <validation-provider
    v-slot="{ errors }"
    :name="name"
    :rules="combinedRules"
  >
    <kube-form-item
      :label="label"
      required
      v-bind="$attrs"
      :message="errors && errors[0]"
    >
      <slot />
      <u-input
        v-model="model"
        :disabled="disabled"
        size="normal huge"
        maxlength="63"
        maxlength-message="不得超过 63 个字符"
        :color="errors && errors[0] ? 'error' : ''"
        placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"
      />
    </kube-form-item>
  </validation-provider>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        label: {
            type: String,
            default: '名称',
        },
        rules: {
            type: Object,
            default: () => ({}),
        },
        name: {
            type: String,
            default: 'Name',
        },
        disabled: Boolean,
    },
    computed: {
        combinedRules() {
            return Object.assign({}, {
                required: true,
                startsWithLowercaseLetter: true,
                ConsistoLetterNumbersUnderscores: true,
                endsWithLowercaseLetterOrNumber: true,
            }, this.rules);
        },
    },
};
</script>

<style>

</style>
