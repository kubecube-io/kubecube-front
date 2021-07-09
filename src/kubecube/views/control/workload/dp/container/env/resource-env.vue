<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 580px"
    :data-template="getDataTemplate"
  >
    <template slot="column">
      <th>Key</th>
      <th>Resource</th>
      <th>ResourceKey</th>
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
          v-model="item.resource"
          size="huge"
          :data="containerNames"
        />
      </td>
      <td>
        <u-select
          v-model="item.resoueceKey"
          size="huge"
          :data="RESOURCE_DATA"
        />
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import envMixin from './env.mixin';
import { RESOURCE_DATA } from 'kubecube/utils/constance';
export default {
    mixins: [ envMixin ],
    props: {
        containers: Array,
    },
    data: () => ({
        RESOURCE_DATA: RESOURCE_DATA.map(k => ({ text: k, value: k })),
    }),
    computed: {
        containerNames() {
            return this.containers.filter(c => c.containerName).map(c => ({
                text: c.containerName,
                value: c.containerName,
            }));
        },
        errorprefix() {
            return `${this.prefixKey}-env-resource-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                resource: '',
                resoueceKey: '',
            };
        },
    },
};
</script>

<style>

</style>
