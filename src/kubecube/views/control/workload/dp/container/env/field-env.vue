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
        <u-select
          v-model="item.field"
          size="huge"
          :data="FIELD_DATA"
        />
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { FIELD_DATA } from 'kubecube/utils/constance';
import envMixin from './env.mixin';

export default {
    mixins: [ envMixin ],
    data() {
        return {
            FIELD_DATA: FIELD_DATA.map(k => ({ text: k, value: k })),
        };
    },
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-field-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                field: '',
            };
        },
    },
};
</script>

<style>

</style>
