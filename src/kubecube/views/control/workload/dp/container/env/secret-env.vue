<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 580px"
    :data-template="getDataTemplate"
  >
    <template slot="column">
      <th>Key</th>
      <th>Secret</th>
      <th>SecretKey</th>
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
          v-model="item.secret"
          size="huge"
          :data="resources"
        />
      </td>
      <td>
        <u-select
          v-model="item.secretKey"
          size="huge"
          :data="getKeys(item.secret)"
        />
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
// import { keys } from 'lodash';
import envMixin from './env.mixin';

export default {
    mixins: [ envMixin ],
    data: () => ({
        resource: 'secrets',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-secrets-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                secret: '',
                secretKey: '',
            };
        },
        // getKeys(value) {
        //     if (!value || !this.resources) return [];
        //     const items = keys(this.resources.find(r => r.value === value).data).map(k => ({
        //         text: k,
        //         value: k,
        //     }));
        //     return items;
        // },
    },
};
</script>

<style>

</style>
