<template>
  <u-popper-select
    label="项目"
    :list="items"
    :value.sync="model"
    :disabled="items.length === 0"
    @before-select="onBeforeSelect($event, 'tenant')"
    @select="onChange"
  />
</template>

<script>
import { get as getFunc } from 'lodash';
import { get, sync } from 'vuex-pathify';
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
        name: 'project',
    }),
    computed: {
        user: get('scope/user.AccountId'),
        project: sync('scope/project'),
        tenant: get('scope/tenant'),
    },
    methods: {
        onBeforeSelect(val) {
            if (!this.isInNSBoard) {
                this.$router.push({ path: '/namespace' });
            }
            this.project = this.items.find(i => i.value === val.value);
            this.model = val.value;
        },
        onChange() {

        },
        async request() {
            if (!this.tenant) return;

            const response = await userService.getUserProjects({
                params: {
                    user: this.user,
                    tenant: this.tenant.value,
                    // labelSelector: `kubecube.io/tenant=${this.tenant.value}`,
                },
            });
            this.items = (response.items || []).map(i => {
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
                current: this.model || this.$route.query.project,
            }, val => {
                console.log(val);
                this.model = getFunc(val, 'metadata.name');
                this.project = val;
            });
        },
    },
};
</script>

<style>

</style>
