<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 100%;"
    :column-comp="null"
    :data-template="getDataTemplate"
    :disabled="disabled"
  >
    <template slot-scope="{ model, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${prefixKey}CIDR-${index}`"
          :rules="{
            cidr: true,
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
              v-model="model.cidr"
              size="huge"
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
        prefixKey: {
            type: String,
            default: '',
        },
        disabled: Boolean,
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.cidr);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                cidr: '',
            };
        },
    },
};
</script>

<style>

</style>
