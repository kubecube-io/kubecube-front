<template>
  <kube-form-item
    layout="block"
    :label="title"
  >
    <kube-dynamic-block
      v-model="model"
      :layout-comp="blockLayout"
      :row-comp="blockRowLayout"
      :column-comp="null"
      :init-required="false"
      :data-template="getDataTemplate"
      style="width: 670px"
      button-name="添加规则"
    >
      <template slot-scope="{ model: blockModel, index: blockIndex }">
        <kube-dynamic-block
          v-model="blockModel.rules"
          style="width: 630px;"
          :data-template="getRuleTemplate"
        >
          <template slot="column">
            <th>Key</th>
            <th>Operator</th>
            <th>Values</th>
          </template>
          <template slot-scope="{ model: ruleModel, index: ruleIndex }">
            <td>
              <validation-provider
                v-slot="{ errors }"
                :name="`affinity-${type}-${blockIndex}-Key-${ruleIndex}`"
                :rules="{
                  startsWithLetter: true,
                  KeyPattern: true,
                  noRedundance: { list: blockModel.rules.map(r => r.key) }
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
                    v-model="ruleModel.key"
                    size="normal huge"
                    :color="errors && errors[0] ? 'error' : ''"
                  />
                </kube-form-item>
              </validation-provider>
            </td>
            <td>
              <u-select
                v-model="ruleModel.operator"
                size="normal huge"
                :data="operators"
              />
            </td>
            <td>
              <validation-provider
                v-slot="{ errors }"
                :name="`affinity-${type}-${blockIndex}-Value-${ruleIndex}`"
                :rules="{
                  multipart: ['Exists', 'DoesNotExist'].includes(ruleModel.operator) ? false : {
                    rule: 'LabelValuePatten',
                    spliter: /\s/,
                  },
                  ConsistofNumber: ['Gt', 'Lt'].includes(ruleModel.operator),
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
                    v-if="['Exists', 'DoesNotExist'].includes(ruleModel.operator)"
                    key="none"
                    disabled
                    size="huge"
                    value="无需填写values"
                  />
                  <u-input
                    v-else
                    v-model="ruleModel.value"
                    size="normal huge"
                    :color="errors && errors[0] ? 'error' : ''"
                  />
                </kube-form-item>
              </validation-provider>
            </td>
          </template>
        </kube-dynamic-block>

        <kube-form
          v-if="['podAntiAffinity', 'podAffinity'].includes(type)"
          label-size="normal"
        >
          <kube-form-item label="作用空间">
            {{ namespace }}
          </kube-form-item>
          <kube-form-item label="拓扑域">
            <u-select
              v-model="blockModel.topologyKey"
              size="huge"
              :data="topologyKeyData"
            />
          </kube-form-item>
        </kube-form>
      </template>
    </kube-dynamic-block>
  </kube-form-item>
</template>

<script>
import { get } from 'vuex-pathify';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
import { makeVModelMixin } from 'kubecube/mixins/functional';
import {
    topologyKeyData,
} from 'kubecube/utils/constance';
import {
    getDefaultAffinity,
    getDefaultAffinityRule,
    operators,
} from 'kubecube/k8s-resources/pod/affinity';
const titleMap = {
    nodeAffinity: '节点亲和性',
    podAffinity: '副本亲和性',
    podAntiAffinity: '副本反亲和性',
};
export default {
    mixins: [ makeVModelMixin ],
    props: {
        type: {
            type: String,
            required: true,
        },
    },
    data: () => ({
        topologyKeyData: topologyKeyData.map(o => ({
            text: o,
            value: o,
        })),
        blockLayout,
        blockRowLayout,
    }),
    computed: {
        namespace: get('scope/namespace@value'),
        title() {
            return titleMap[this.type];
        },
        operators() {
            return (this.type === 'nodeAffinity' ? operators : operators.slice(0, -2)).map(o => ({
                text: o,
                value: o,
            }));
        },
    },
    methods: {
        getDataTemplate() {
            return getDefaultAffinity(this.type, this.namespace);
        },
        getRuleTemplate() {
            return getDefaultAffinityRule();
        },
    },
};
</script>

<style>

</style>
