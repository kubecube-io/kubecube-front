<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 580px"
    :data-template="getDataTemplate"
  >
    <template slot="column">
      <th>Key</th>
      <th>Value</th>
    </template>
    <template slot-scope="{ model: item, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${errorprefix}key-${index}`"
          rules="startsWithLetter|ConsistofLetterNumbersUnderscores"
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
              v-model="item.key"
              size="huge"
              maxlength="64"
              placeholder="1-64位字母、数字或下划线组成，以字母开头"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${errorprefix}value-${index}`"
          rules="ConsistofUnicode"
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
              v-model="item.value"
              size="huge"
              maxlength="2048"
              placeholder="0-2048个 ASCII 字符组成"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import envMixin from './env.mixin';

export default {
    mixins: [ envMixin ],
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-value-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
            };
        },
    },
};
</script>

<style>

</style>
