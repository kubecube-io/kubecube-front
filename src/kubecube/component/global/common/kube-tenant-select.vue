<template>
  <kube-valve
    name="tenant"
    style="display: inline-block;"
    :request="getTenants"
    :valve="modelValue"
  >
    <u-select
      v-if="list.length > 0"
      v-model="modelValue"
      :data="list"
      v-bind="$attrs"
    />
    <u-select
      v-else
      v-bind="$attrs"
      value="暂无租户"
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
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
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
                return getFunc(this.model, 'value', null);
            },
            set(val) {
                this.model = this.list.find(m => m.value === val);
            },
        },
    },
    methods: {
        async getTenants() {
            const response = await userService.getUserTenants({
                params: {
                    user: this.user,
                },
            });
            this.list = (getFunc(response, 'items') || []).map(i => {
                const m = toTenantPlainObject(i);
                return {
                    text: m.spec.displayName,
                    value: m.metadata.name,
                    ...m,
                };
            });
            setValueIfListNotPresent({
                list: this.list,
                path: 'value',
                current: getFunc(this.model, 'value'),
            }, val => {
                this.modelValue = getFunc(val, 'value');
            });
        },
    },

};
</script>

<style>

</style>
