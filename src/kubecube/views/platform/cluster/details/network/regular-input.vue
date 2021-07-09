<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 100%;"
    :data-template="getDataTemplate"
  >
    <template slot="column">
      <th>
        Key
      </th>
      <th>
        Operator
      </th>
      <th>Values</th>
    </template>
    <template slot-scope="{ model, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${prefixKey}Key-${index}`"
          :rules="{
            KeyPattern: true,
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
              v-model="model.key"
              size="huge"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
      <td>
        <u-select
          v-model="model.operator"
          size="huge"
          :data="OPERATORS"
        />
      </td>
      <td>
        <validation-provider
          v-if="!['Exists', 'DoesNotExist'].includes(model.operator)"
          v-slot="{ errors }"
          :name="`${prefixKey}Value-${index}`"
          :rules="{
            LabelValuePatten: model.operator === 'label',
            multipart: ['In', 'NotIn'].includes(model.operator) && {
              rule: 'LabelValuePatten',
              spliter: /\s+/,
            }
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
              v-model="model.values"
              size="huge"
              :placeholder="getPlaceholder(model.operator)"
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
import { OPERATORS } from 'kubecube/utils/constance';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            OPERATORS,
        };
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
                operator: 'label',
                values: '',
            };
        },
        getPlaceholder(operator) {
            return (OPERATORS.find(item => item.value === operator) || {}).placeholder || '';
        },
    },
};
</script>

<style>

</style>
