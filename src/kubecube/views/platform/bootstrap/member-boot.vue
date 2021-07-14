<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-pipe
      graph="tenant > project > role"
      direction="horizontal"
    >
      <kube-form
        ref="form"
        style="margin-top:20px"
      >
        <kube-form-item
          label="所属租户"
          required
        >
          <kube-tenant-select
            v-model="model.tenant"
            size="normal huge"
          />
        </kube-form-item>
        <kube-form-item
          label="所属项目"
        >
          <kube-project-select
            v-model="model.project"
            size="normal huge"
            :tenant="model.tenant && model.tenant.value"
          />
        </kube-form-item>
        <kube-form-item
          label="账号"
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
                v-model="model.user"
                size="normal huge"
                :data="data"
              />
            </template>
          </x-request>
        </kube-form-item>
        <kube-form-item
          label="角色"
          required
        >
          <kube-role-select
            v-model="model.role"
            size="normal huge"
            :tenant="model.tenant"
            :project="model.project"
          />
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
    </kube-pipe>
  </validation-observer>
</template>

<script>
import { get } from 'lodash';
import userService from 'kubecube/services/user';
import {
    toK8SObject as toRoleBindingK8SObject,
} from 'kubecube/k8s-resources/rolebinding/rolebinding';
import kubeTenantSelect from 'kubecube/component/global/common/kube-tenant-select.vue';
import kubeProjectSelect from 'kubecube/component/global/common/kube-project-select.vue';
import kubeRoleSelect from 'kubecube/component/global/common/kube-role-select.vue';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';

export default {
    components: {
        kubeTenantSelect,
        kubeProjectSelect,
        kubeRoleSelect,
    },
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
            const finded = items.find(i => i.value === this.model.user);
            if (!finded) {
                this.model.user = get(items, '[0].value');
            }

            return items;
        },
        async submit() {
            const data = toRoleBindingK8SObject(
                this.model.user,
                this.model.tenant,
                this.model.project,
                this.model.role.value);
            await userService.createRoleBindings({
                data,
            });
            this.$toast.success('创建成功');
        },
    },
};
</script>

<style>

</style>
