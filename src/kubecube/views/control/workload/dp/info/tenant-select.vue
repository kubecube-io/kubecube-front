<template>
  <x-request
    ref="request"
    :service="service"
    :params="{
      params: {
        user,
      },
    }"
    :processor="resolver"
  >
    <template slot-scope="{ data, loading }">
      <u-loading v-if="loading" />
      <kube-form-item label="租户">
        <u-select
          v-model="model"
          :disabled="disabled"
          :data="data"
        />
      </kube-form-item>
    </template>
  </x-request>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import userService from 'kubecube/services/user';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        disabled: Boolean,
    },
    data() {
        return {
            service: userService.getUserTenants,
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
    },
    methods: {
        resolver(response) {
            const items = (response.items || []).map(i => ({
                text: i.spec.displayName,
                value: i.metadata.name,
            }));
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: this.model,
            }, val => {
                this.model = getFunc(val, 'value');
            });

            return items;
        },
    },
};
</script>

<style>

</style>
