<template>
  <u-popper-select
    label="租户"
    :list="items"
    :value.sync="model"
    :disabled="items.length === 0"
    @before-select="onBeforeSelect($event, 'tenant')"
    @select="onChange"
  />
</template>

<script>
import { get as getFunc } from 'lodash';
import { sync, get } from 'vuex-pathify';
import valveMixin from 'kubecube/mixins/pipe/valve.mixin';
import userService from 'kubecube/services/user';
import {
    toPlainObject,
} from 'kubecube/k8s-resources/scope/tenant';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    extends: valveMixin,
    data: () => ({
        items: [],
        name: 'tenant',
    }),
    computed: {
        user: get('scope/user.AccountId'),
        tenant: sync('scope/tenant'),
        isInNSBoard() {
            return this.$route.path === '/namespace';
        },
    },
    methods: {
        onBeforeSelect(val) {
            if (!this.isInNSBoard) {
                this.$router.push({ path: '/namespace' });
            }
            this.tenant = this.items.find(i => i.value === val.value);
            this.model = val.value;
        },
        onChange() {

        },
        async request() {
            const response = await userService.getUserTenants({
                params: {
                    user: this.user,
                },
            });
            this.items = (getFunc(response, 'items') || []).map(i => {
                const m = toPlainObject(i);
                return {
                    text: m.spec.displayName,
                    value: m.metadata.name,
                    ...m,
                };
            });

            setValueIfListNotPresent({
                list: this.items,
                path: 'metadata.name',
                current: this.model || this.$route.query.tenant,
            }, val => {
                console.log(val);
                this.model = getFunc(val, 'metadata.name');
                this.tenant = val;
            });
        },
    },
};
</script>

<style>

</style>
