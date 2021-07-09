<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 578px"
    :layout-comp="blockLayout"
    :row-comp="blockRowLayout"
    :column-comp="null"
    :data-template="getDataTemplate"
    button-name="添加镜像仓库配置"
  >
    <template slot-scope="{ model: row, index }">
      <kube-form label-size="small">
        <validation-provider
          v-slot="{ errors }"
          :name="`repo-${index}`"
          :rules="{
            required: true,
            noRedundance: { list: exsitKeys }
          }"
        >
          <kube-form-item
            :message="errors && errors[0]"
            label="镜像仓库"
            required
          >
            <u-input
              v-model="row.host"
              size="normal large"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          :name="`username-${index}`"
          rules="required"
        >
          <kube-form-item
            :message="errors && errors[0]"
            label="用户名"
            required
          >
            <u-input
              v-model="row.username"
              size="normal large"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          :name="`password-${index}`"
          rules="required"
        >
          <kube-form-item
            :message="errors && errors[0]"
            label="密码"
            required
          >
            <u-input
              v-model="row.password"
              size="normal large"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          :name="`email-${index}`"
          rules="email"
        >
          <kube-form-item
            :message="errors && errors[0]"
            label="邮件"
          >
            <u-input
              v-model="row.email"
              size="normal large"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </kube-form>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import blockLayout from 'kubecube/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubecube/component/common/kube-dynamic-block-layout/row.vue';
export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            blockLayout,
            blockRowLayout,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.host);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                host: '',
                username: '',
                password: '',
                email: '',
            };
        },
    },
};
</script>

<style>

</style>
