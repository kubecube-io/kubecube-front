<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 100%;"
    :column-comp="null"
    :data-template="getDataTemplate"
  >
    <template slot-scope="{ model, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${errorPrefix}-${index}`"
          :rules="{
            ...rules,
            noRedundance: { list: exsitKeys }
          }"
        >
          <kube-form-item
            muted="no"
            style="width: 100%;"
            field-size="full"
            layout="none"
            :message="errors && errors[0]"
            placement="bottom"
          >
            <u-input
              v-model="model.path"
              size="huge"
              v-bind="$attrs"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        errorPrefix: String,
        rules: Object,
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
            };
        },
    },
};
</script>

<style>

</style>
