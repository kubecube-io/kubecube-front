<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 100%;"
    :data-template="getDataTemplate"
    :disabled="disabled"
  >
    <template slot="column">
      <th>
        端口
      </th>
      <th>协议</th>
    </template>
    <template slot-scope="{ model, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${prefixKey}Port-${index}`"
          :rules="{
            NumberBetween: {min: 1, max: 65536},
            ConsistofNumber: true,
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
              v-model="model.port"
              size="huge"
              :disabled="model.disabled"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
      <td>
        <u-select
          v-model="model.protocol"
          size="huge"
          :data="protocols"
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
        selectKeys: Array,
        prefixKey: {
            type: String,
            default: '',
        },
        disabled: Boolean,
    },
    data() {
        return {
            protocols: [
                { text: 'TCP', value: 'TCP' },
                { text: 'UDP', value: 'UDP' },
            ],
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => `${t.port}${t.protocol}`);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                port: '',
                protocol: 'TCP',
            };
        },
    },
};
</script>

<style>

</style>
