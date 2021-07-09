<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form
      ref="form"
      style="margin-top: 20px"
    >
      <validation-provider
        v-slot="{ errors }"
        name="Name"
        rules="required"
      >
        <kube-form-item
          label="租户名称"
          required
          :message="errors && errors[0]"
          maxlength="64"
          maxlength-message="不得超过 64 个字符"
        >
          <u-input
            v-model="model.model.spec.displayName"
            size="normal huge"
            :color="errors && errors[0] ? 'error' : ''"
          />
        </kube-form-item>
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        name="DisplayName"
        rules="required"
      >
        <kube-form-item
          label="租户标识"
          required
          :message="errors && errors[0]"
        >
          <u-input
            v-model="model.model.metadata.name"
            size="normal huge"
            :color="errors && errors[0] ? 'error' : ''"
            maxlength="32"
            maxlength-message="不得超过 32 个字符"
            placeholder="全局唯一的标识，2-32个小写字母、数字、中划线组成"
          />
        </kube-form-item>
      </validation-provider>

      <kube-form-item
        label="租户管理员"
        required
      >
        <x-request
          ref="request"
          :service="userService"
          :params="{}"
          :processor="userResolver"
        >
          <template slot-scope="{ data }">
            <u-select
              v-model="model.tenantadmin"
              size="normal huge"
              :data="data"
            />
          </template>
        </x-request>
      </kube-form-item>

      <kube-form-item>
        <u-submit-button
          :click="submit.bind(this)"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                创建
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { get } from 'lodash';
import scopeService from 'kubecube/services/scope';
import userService from 'kubecube/services/user';
import {
    toK8SObject,
} from 'kubecube/k8s-resources/scope/tenant';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

import {
    toK8SObject as toRoleBindingK8SObject,
} from 'kubecube/k8s-resources/rolebinding/rolebinding';

import { retryAsync } from 'kubecube/utils/functional';

export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            userService: userService.getUserList,
        };
    },
    methods: {
        userResolver(result) {
            const items = get(result, 'items', []).map(i => ({
                text: i.spec.displayName,
                value: i.name,
            }));
            const finded = items.find(i => i.value === this.model.tenantadmin);
            if (!finded) {
                this.model.tenantadmin = get(items, '[0].value');
            }

            return items;
        },
        async submit() {
            const response = await scopeService.createScope({
                pathParams: {
                    scope: 'tenants',
                },
                data: toK8SObject(this.model.model),
            });

            const tenantCurr = toK8SObject(response.data);
            tenantCurr.spec.namespace = `kubecube-tenant-${tenantCurr.metadata.name}`;

            const data = toRoleBindingK8SObject(
                this.model.tenantadmin,
                tenantCurr,
                {},
                'tenant-admin');
            await retryAsync(() => userService.createRoleBindings({
                data,
            }), 3000, 3);

            this.$toast.success('创建成功');
        },
    },
};
</script>

<style>

</style>
