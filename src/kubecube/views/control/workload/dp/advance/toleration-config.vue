<template>
  <kube-form-item
    layout="list"
    label="容忍"
  >
    <kube-dynamic-block
      v-model="model"
      style="width: 750px"
      :data-template="getDataTemplate"
      :init-required="false"
    >
      <template slot="column">
        <th>Key</th>
        <th>Operator</th>
        <th>Value</th>
        <th>Effect <u-note>effect可取值 NoSchedule | PreferNoSchedule | NoExecute | 空， effect 为空表示匹配所有 effect。</u-note></th>
        <th>TolerationSeconds<u-note>缺省不进行设置，表示永久生效。</u-note></th>
      </template>
      <template slot-scope="{ model: tolerationModel, index }">
        <td>
          <validation-provider
            v-slot="{ errors }"
            :name="`toleration-Key-${index}`"
            :rules="{
              startsWithLetter: true,
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
                v-model="tolerationModel.key"
                size="normal huge"
                :color="errors && errors[0] ? 'error' : ''"
              />
            </kube-form-item>
          </validation-provider>
        </td>
        <td>
          <u-select
            v-model="tolerationModel.operator"
            size="huge"
            :data="operators"
          />
        </td>
        <td>
          <validation-provider
            v-if="tolerationModel.operator !== 'Exists'"
            v-slot="{ errors }"
            :name="`toleration-Value-${index}`"
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
                v-model="tolerationModel.value"
                size="huge"
                :color="errors && errors[0] ? 'error' : ''"
              />
            </kube-form-item>
          </validation-provider>
        </td>
        <td>
          <u-select
            v-model="tolerationModel.effect"
            size="huge"
            :data="effects"
          />
        </td>
        <td>
          <u-number-input
            v-if="tolerationModel.effect === 'NoExecute'"
            v-model="tolerationModel.tolerationSeconds"
            size="huge"
            :min="0"
          />
        </td>
      </template>
    </kube-dynamic-block>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
import {
    operators, effects, getDefaultToleration,
} from 'kubecube/k8s-resources/pod/toleration.js';
export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            operators: operators.map(t => ({ text: t, value: t })),
            effects: effects.map(t => ({ text: t, value: t })),
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(r => r.key);
        },
    },
    methods: {
        getDataTemplate: getDefaultToleration,
    },
};
</script>

<style>

</style>
