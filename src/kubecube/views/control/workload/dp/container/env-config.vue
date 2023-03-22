<template>
  <div>
    <el-form-item label="环境变量">
      <dynamicTab
        :value="tabs"
        :showAddBtn="false"
        :showDeleteBtn="false"
      >
        <template v-slot:tabNav="{item}">
          {{item.title}}
          <span
            v-if="item.tab === 'value' && valueLength"
            :class="$style.indicator"
          >
            {{ valueLength }}
          </span>
          <span
            v-if="item.tab === 'secretKeyRef' && secretLength"
            :class="$style.indicator"
          >
            {{ secretLength }}
          </span>
          <span
            v-if="item.tab === 'configMapKeyRef' && configmapLength"
            :class="$style.indicator"
          >
            {{ configmapLength }}
          </span>
          <span
            v-if="item.tab === 'fieldRef' && fieldLength"
            :class="$style.indicator"
          >
            {{ fieldLength }}
          </span>
          <span
            v-if="item.tab === 'resourceFieldRef' && resourceLength"
            :class="$style.indicator"
          >
            {{ resourceLength }}
          </span>
          <i v-if="hasError(item.tab, validateStatus)" :class="['el-icon-warning', $style.errorIcon]"/>
        </template>
        <template slot-scope="{item}">
          <value-config
            v-if="item.tab === 'value'"
            v-model="model.value"
            :prefix-key="`${errorPrefix}.${item.tab}`"
            :existKeys="existKeys"
          />
          <secret-config
            v-if="item.tab === 'secretKeyRef'"
            v-model="model.secretKeyRef"
            :prefix-key="`${errorPrefix}.${item.tab}`"
            :existKeys="existKeys"
          />
          <configmap-config
            v-if="item.tab === 'configMapKeyRef'"
            v-model="model.configMapKeyRef"
            :existKeys="existKeys"
            :prefix-key="`${errorPrefix}.${item.tab}`"
          />
          <field-config
            v-if="item.tab === 'fieldRef'"
            v-model="model.fieldRef"
            :prefix-key="`${errorPrefix}.${item.tab}`"
            :existKeys="existKeys"
          />
          <resource-config
            v-if="item.tab === 'resourceFieldRef'"
            v-model="model.resourceFieldRef"
            :containers="containers"
            :prefix-key="`${errorPrefix}.${item.tab}`"
            :existKeys="existKeys"
          />
        </template>
      </dynamicTab>
    </el-form-item>
  </div>
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
    inject: [ 'elForm' ],
    data() {
        return {
            tabs: [
                { tab: 'value', title: '值' },
                { tab: 'secretKeyRef', title: 'Secret' },
                { tab: 'configMapKeyRef', title: 'Configmap' },
                { tab: 'fieldRef', title: 'Field' },
                { tab: 'resourceFieldRef', title: 'Resource' },
            ],
            validateStatus: {}
        }
    },
    watch: {
        model: {
            handler() {
                this.validateStatus = {};
            },
        },
    },
    computed: {
        existKeys() {
            const typeKeys = Object.keys(this.model)
            const res = [];
            typeKeys.forEach(type => {
                res.push(...(this.model[type] || []).map(i => i.key))
            });
            return res.filter(i => i);
        },
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
    mounted() {
        this.elForm && this.elForm.$on('validate', this.validateListener);
    },
    destroyed() {
        this.elForm && this.elForm.$off('validate', this.validateListener);
    },
    methods: {
        validateListener(prop, valid, message) {
            if (this.errorPrefix && prop.startsWith(`${this.errorPrefix}.`)) {
                const key = prop.slice(`${this.errorPrefix}`.length).split('.')[1];
                if (this.validateStatus[key]) {
                    this.validateStatus[key][prop] = { valid, message };
                } else {
                    this.validateStatus[key] = {};
                    this.validateStatus[key][prop] = { valid, message };
                }
                this.validateStatus = { ...this.validateStatus };
            }
        },
        hasError(index, validateStatus) {
            const status = validateStatus[index];
            const keys = status ? Object.keys(status) : [];
            return keys.some(key => status[key] && !status[key].valid);
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
.errorIcon{
  font-size: 14px;
  color: #f54545;
  cursor: pointer;
  position: absolute;
  top: 12px;
  left: 4px;
}
</style>
