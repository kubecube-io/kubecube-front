<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 100%;"
    :data-template="getDataTemplate"
    :disabled="disabled"
  >
    <template slot="column">
      <th>
        Key
      </th>
      <th>Value</th>
    </template>
    <template slot-scope="{ model }">
      <td>
        <u-input
          v-model="model.key"
          size="huge"
          :disabled="model.disabled"
        />
      </td>
      <td>
        <u-input
          v-model="model.value"
          size="huge"
          :disabled="disabled || model.disabled"
        />
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        disabled: Boolean,
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
                disabled: false,
            };
        },
    },
};
</script>

<style>

</style>
