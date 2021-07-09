<template>
  <kube-form-item
    label="环境变量"
    layout="block"
  >
    <kube-tab
      :list="tabs"
      title-key="title"
      tab-key="tab"
      :error-prefix="errorPrefix"
      disabled
    >
      <template #[`configmap.tab`]>
        <span
          v-if="configmapLength"
          :class="$style.indicator"
        >
          {{ configmapLength }}
        </span>
      </template>
      <template #configmap="{ errorPrefix: prefix }">
        <configmap-config
          v-model="model.configMapKeyRef"
          :prefix-key="prefix"
        />
      </template>
      <template #[`value.tab`]>
        <span
          v-if="valueLength"
          :class="$style.indicator"
        >
          {{ valueLength }}
        </span>
      </template>
      <template #value="{ errorPrefix: prefix }">
        <value-config
          v-model="model.value"
          :prefix-key="prefix"
        />
      </template>
      <template #[`secret.tab`]>
        <span
          v-if="secretLength"
          :class="$style.indicator"
        >
          {{ secretLength }}
        </span>
      </template>
      <template #secret="{ errorPrefix: prefix }">
        <secret-config
          v-model="model.secretKeyRef"
          :prefix-key="prefix"
        />
      </template>
      <template #[`field.tab`]>
        <span
          v-if="fieldLength"
          :class="$style.indicator"
        >
          {{ fieldLength }}
        </span>
      </template>
      <template #field="{ errorPrefix: prefix }">
        <field-config
          v-model="model.fieldRef"
          :prefix-key="prefix"
        />
      </template>
      <template #[`resource.tab`]>
        <span
          v-if="resourceLength"
          :class="$style.indicator"
        >
          {{ resourceLength }}
        </span>
      </template>
      <template #resource="{ errorPrefix: prefix }">
        <resource-config
          v-model="model.resourceFieldRef"
          :containers="containers"
          :prefix-key="prefix"
        />
      </template>
    </kube-tab>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import configmapConfig from './env/configmap-env.vue';
import valueConfig from './env/value-env.vue';
import secretConfig from './env/secret-env.vue';
import fieldConfig from './env/field-env.vue';
import resourceConfig from './env/resource-env.vue';
export default {
    components: {
        configmapConfig,
        valueConfig,
        secretConfig,
        fieldConfig,
        resourceConfig,
    },
    mixins: [ makeVModelMixin ],
    props: {
        errorPrefix: String,
        containers: Array,
    },
    data() {
        return {
            tabs: [
                { tab: 'value', title: '值' },
                { tab: 'secret', title: 'Secret' },
                { tab: 'configmap', title: 'Configmap' },
                { tab: 'field', title: 'Field' },
                { tab: 'resource', title: 'Resource' },
            ],
        };
    },
    computed: {
        valueLength() {
            return this.model.value.filter(p => p.key && p.value).length;
        },
        configmapLength() {
            return this.model.configMapKeyRef.filter(p => p.key && p.configmap && p.configmapKey).length;
        },
        secretLength() {
            return this.model.secretKeyRef.filter(p => p.key && p.secret && p.secretKey).length;
        },
        fieldLength() {
            return this.model.fieldRef.filter(p => p.key && p.field).length;
        },
        resourceLength() {
            return this.model.resourceFieldRef.filter(p => p.key && p.resource && p.resoueceKey).length;
        },
    },
};
</script>

<style module>
.indicator{
    display: inline-block;
    position: absolute;
    width: 1.25em;
    height: 1.25em;
    line-height: 1.25em;
    background: #cad4e4;
    color: #fff;
    border-radius: 100%;
    right: 4px;
    text-align: center;
    top: 3px;
    font-size: .8em;
}
</style>
