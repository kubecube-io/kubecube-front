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
        <u-note size="large">
          <div>Key 分为前缀和后缀，以/分隔，可只写后缀。</div>
          <div>前缀: 0-253位小写字母、数字、"-"、"."组成，以字母或数字开头、结尾，"."之前需为字母或数字。</div>
          <div>后缀: 1-63位字母、数字、"-"、"_"或"."组成，以字母或数字开头、结尾。</div>
        </u-note>
      </th>
      <th>Value</th>
    </template>
    <template slot-scope="{ model, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${prefixKey}Key-${index}`"
          :rules="{
            KeyPattern: true,
            noSystemKey: !noSystemKeyRule && !model.disabled,
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
            <u-suggest
              v-if="selectKeys"
              v-model="model.key"
              size="huge"
              name="key"
              autocomplete="off"
              :data="selectKeys"
              :disabled="disabled || model.disabled"
              :color="errors && errors[0] ? 'error' : ''"
            />
            <u-input
              v-else
              v-model="model.key"
              size="huge"
              :disabled="model.disabled"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${prefixKey}Value-${index}`"
          rules="LabelValuePatten"
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
              v-model="model.value"
              size="huge"
              :disabled="disabled || model.disabled"
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
        selectKeys: Array,
        prefixKey: {
            type: String,
            default: '',
        },
        noSystemKeyRule: {
            type: Boolean,
            default: false,
        },
        disabled: Boolean,
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
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
