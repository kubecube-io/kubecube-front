<template>
  <kube-form-item
    layout="block"
    label="容器端口"
  >
    <u-switch
      v-model="model.enable"
      width="wide"
      :with-text="true"
    />
    <template v-if="model.enable">
      <kube-dynamic-block
        v-model="model.configs"
        style="width: 580px"
        :data-template="getDataTemplate"
      >
        <template slot="column">
          <th>端口</th>
          <th>名称</th>
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
                <u-number-input
                  v-model="model.containerPort"
                  :color="errors && errors[0] ? 'error' : ''"
                  size="huge"
                  :min="1"
                  :max="65535"
                />
              </kube-form-item>
            </validation-provider>
          </td>
          <td>
            <validation-provider
              v-slot="{ errors }"
              :name="`${prefixKey}Name-${index}`"
              :rules="{
                startsWithLowercaseLetter: true,
                ConsistoLetterNumbersUnderscores: true,
                lengthBetween: {min: 0, max: 15},
                noRedundance: { list: allNames }
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
                  v-model="model.name"
                  :color="errors && errors[0] ? 'error' : ''"
                  size="huge"
                  maxlength="15"
                  maxlength-message="不得超过15个字符"
                  placeholder="1-15位小写字母、数字或中划线组成，以字母开头，字母或数字结尾"
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
  </kube-form-item>
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
        allNames() {
            return this.model.configs.map(t => t.name);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                containerPort: 8080,
                name: '',
                protocol: 'TCP',
            };
        },
    },
};
</script>

<style>

</style>
