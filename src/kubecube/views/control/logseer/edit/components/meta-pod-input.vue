<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 100%;"
    :data-template="getDataTemplate"
  >
    <template slot="column">
      <th>类型</th>
      <th>Key</th>
    </template>
    <template slot-scope="{ model, index }">
      <td>
        <u-select
          v-model="model.label"
          size="huge"
        >
          <u-select-item value="labels">
            label
          </u-select-item>
          <u-select-item value="env">
            env
          </u-select-item>
          <u-select-item value="annotations">
            annotation
          </u-select-item>
        </u-select>
      </td>
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${errorPrefix}-${index}`"
          rules="KeyPattern"
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
              v-model="model.key"
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
        errorPrefix: String,
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                type: 'log',
                label: '',
                key: '',
            };
        },
    },
};
</script>

<style>

</style>
