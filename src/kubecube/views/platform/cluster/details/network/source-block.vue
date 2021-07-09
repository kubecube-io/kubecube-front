<template>
  <kube-dynamic-block
    v-model="model"
    :layout-comp="blockLayout"
    :row-comp="blockRowLayout"
    :column-comp="null"
    :data-template="getTemplate"

    button-name="添加规则"
  >
    <template slot-scope="{ model, index }">
      <kube-form label-size="small">
        <kube-form-item
          label="IP 段"
          :layout="model.ipBlock.enable ? 'block': 'normal'"
        >
          <span slot="label">
            <u-note>ip规则同空间、副本选择规则不可同时设置。</u-note>
          </span>
          <u-radios
            v-model="model.ipBlock.enable"
            @change="onChangeIp($event, model)"
          >
            <u-radio :label="false">
              不设置 IP 段
            </u-radio>
            <u-radio :label="true">
              指定 IP 段
            </u-radio>
          </u-radios>
          <template v-if="model.ipBlock.enable">
            <validation-provider
              v-slot="{ errors }"
              :name="`${prefixKey}-ip-${index}-cidr`"
              rules="cidr"
            >
              <kube-form-item
                label="CIDR"
                layout="list"
                :message="errors && errors[0]"
              >
                <u-input
                  v-model="model.ipBlock.cidr"
                  :color="errors && errors[0] ? 'error' : ''"
                  size="large"
                />
              </kube-form-item>
            </validation-provider>
            <kube-form-item
              label="例外 CIDR"
              layout="list"
            >
              <cidr-input
                v-model="model.ipBlock.except"
                :prefix-key="`${prefixKey}-ip-${index}-except`"
              />
            </kube-form-item>
          </template>
        </kube-form-item>

        <kube-form-item
          label="空间规则"
          :layout="model.namespaceSelector.enable ? 'block': 'normal'"
        >
          <u-radios
            v-model="model.namespaceSelector.enable"
            :disabled="model.namespaceSelector.disabled"
          >
            <u-radio :label="false">
              所有空间
            </u-radio>
            <u-radio :label="true">
              符合规则的空间
            </u-radio>
          </u-radios>
          <regular-input
            v-if="model.namespaceSelector.enable"
            v-model="model.namespaceSelector.matchExpressions"
            :prefix-key="`${prefixKey}-ip-${index}-namespace`"
          />
        </kube-form-item>
        <kube-form-item
          label="副本规则"
          :layout="model.podSelector.enable ? 'block': 'normal'"
        >
          <u-radios
            v-model="model.podSelector.enable"
            :disabled="model.podSelector.disabled"
          >
            <u-radio :label="false">
              所有副本
            </u-radio>
            <u-radio :label="true">
              符合规则的副本
            </u-radio>
          </u-radios>
          <regular-input
            v-if="model.podSelector.enable"
            v-model="model.podSelector.matchExpressions"
            :prefix-key="`${prefixKey}-ip-${index}-pod`"
          />
        </kube-form-item>
      </kube-form>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
import cidrInput from './cidr-inputs.vue';
import regularInput from './regular-input.vue';
export default {
    components: {
        cidrInput,
        regularInput,
    },
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            blockLayout,
            blockRowLayout,
        };
    },
    methods: {
        getTemplate() {
            return {
                ipBlock: {
                    enable: false,
                    cidr: '',
                    except: [],
                },
                namespaceSelector: {
                    disabled: false,
                    enable: false,
                    matchExpressions: [],
                },
                podSelector: {
                    disabled: false,
                    enable: false,
                    matchExpressions: [],
                },
            };
        },
        onChangeIp($event, model) {
            if ($event.value) {
                model.namespaceSelector.enable = false;
                model.podSelector.enable = false;
                model.namespaceSelector.disabled = true;
                model.podSelector.disabled = true;
            } else {
                model.namespaceSelector.disabled = false;
                model.podSelector.disabled = false;
            }
        },
    },
};
</script>

<style>

</style>
