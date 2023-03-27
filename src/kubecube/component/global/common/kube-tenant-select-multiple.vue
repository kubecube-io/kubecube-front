<template>
  <kube-valve
    name="tenant"
    style="display: inline-block;max-width: 100%;"
    :request="getTenants"
    :valve="modelValue"
  >
    <el-select
      v-if="list.length > 0"
      v-model="modelValue"
      :data="list"
      v-bind="$attrs"
      multiple
      filterable
      clearable
    >
      <el-option
        v-for="item in list"
        :key="item.value"
        :label="item.text"
        :value="item.value"
        :title="item.text"
      />
    </el-select>
    <el-input
      v-else
      v-bind="$attrs"
      placeholder="暂无租户"
      disabled
    />
  </kube-valve>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import userService from 'kubecube/services/user';
import {
    toPlainObject as toTenantPlainObject,
} from 'kubecube/k8s-resources/scope/tenant';
export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            list: [],
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
        modelValue: {
            get() {
                return (this.model || []).map(item => item.value);
            },
            set(val) {
                this.model = this.list.filter(m => val.includes(m.value));
            },
        },
    },
    methods: {
        async getTenants() {
            const response = await userService.getUserTenants({
                // params: {
                //     user: this.user,
                // },
            });
            this.list = (getFunc(response, 'items') || []).map(i => {
                const m = toTenantPlainObject(i);
                return {
                    text: m.spec.displayName,
                    value: m.metadata.name,
                    ...m,
                };
            });
            this.modelValue = [];
            this.$emit('syncTenant', this.list);
        },
    },

};
</script>

<style>

</style>
