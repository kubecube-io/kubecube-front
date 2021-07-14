<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form style="margin-top: 20px">
      <kube-form-item
        label="租户"
        required
      >
        <x-request
          ref="request"
          :service="tenantService"
          :params="{
            params: {
              user,
            }
          }"
          :processor="tenantResolver"
        >
          <u-select
            v-model="model.model.tenant"
            size="normal huge"
            :data="tenants"
          />
        </x-request>
      </kube-form-item>

      <validation-provider
        v-slot="{ errors }"
        name="DisplayName"
        rules="required"
      >
        <kube-form-item
          label="项目名称"
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
        name="Name"
        rules="required"
      >
        <kube-form-item
          label="项目标识"
          required
          :message="errors && errors[0]"
        >
          <u-input
            v-model="model.model.metadata.name"
            size="normal huge"
            :color="errors && errors[0] ? 'error' : ''"
            maxlength="32"
            maxlength-message="不得超过 32 个字符"
            placeholder="全局唯一的标识，2-32个小写字母、数字组成、中划线-"
          />
        </kube-form-item>
      </validation-provider>

      <kube-form-item
        label="项目描述"
      >
        <u-input
          v-model="model.model.spec.description"
          size="normal huge"
          maxlength="32"
          maxlength-message="不得超过 32 个字符"
        />
      </kube-form-item>

      <kube-form-item
        label="项目管理员"
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
              v-model="model.projectadmin"
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
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import scopeService from 'kubecube/services/scope';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import {
    // toPlainObject as toProjectPlainObject,
    toK8SObject as toProjectK8SObject,
} from 'kubecube/k8s-resources/scope/project';
export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            tenantService: userService.getUserTenants,
            userService: userService.getUserList,
            tenants: [],
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
    },
    methods: {
        tenantResolver(data) {
            const items = data.items.map(i => ({
                text: getFunc(i, 'spec.displayName'),
                value: getFunc(i, 'metadata.name'),
            }));
            this.tenants = items;
            if (!this.model.model.tenant) {
                this.model.model.tenant = items[0].value;
            }
            return items;
        },
        userResolver(result) {
            const items = (getFunc(result, 'items') || []).map(i => ({
                text: i.spec.displayName,
                value: i.name,
            }));
            const finded = items.find(i => i.value === this.model.projectadmin);
            if (!finded) {
                this.model.projectadmin = getFunc(items, '[0].value');
            }

            return items;
        },
        async submit() {
            await scopeService.createScope({
                pathParams: {
                    scope: 'projects',
                },
                data: toProjectK8SObject(this.model.model),
            });
            this.$toast.success('创建成功');
        },
    },

};
</script>

<style>

</style>
