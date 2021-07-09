<template>
  <u-modal
    title="新建角色"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <kube-form ref="form">
        <validation-provider
          v-slot="{ errors }"
          name="Name"
          rules="required"
        >
          <kube-form-item
            label="名称"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="name"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <kube-form-item
          label="角色层级"
          required
        >
          <u-text>{{ curLevel }} </u-text>
        </kube-form-item>

        <kube-form-item
          label="新建方式"
          required
        >
          <u-radios v-model="mode">
            <u-radio label="simple">
              自定义
            </u-radio>
            <u-radio label="extend">
              继承已有
            </u-radio>
          </u-radios>
        </kube-form-item>

        <u-submit-button
          :click="submit.bind(this)"
          place="right"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                确定
              </u-button>
              <u-button @click="close">
                取消
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form>
    </validation-observer>
  </u-modal>
</template>

<script>
// 账号的身份
import { Modal } from '@micro-app/common/mixins';
import { get } from 'lodash';
import userService from 'kubecube/services/user';
import roleService from 'kubecube/services/role-binding';
import {
    toK8SObject as toRoleK8SObject,
} from 'kubecube/k8s-resources/role';

export default {
    mixins: [ Modal ],
    data() {
        return {
            name: '',
            mode: 'simple',
        };
    },
    computed: {
        identity() {
            return this.$route.params.identity;
        },
        curLevel() {
            switch (this.identity) {
                case 'platform':
                    return '平台';
                case 'tenant':
                    return '租户';
                case 'project':
                    return '项目';
                default:
                    return '';
            }
        },
    },
    methods: {
        open() {
            this.name = '';
            this.mode = 'simple';
            this.show = true;
        },
        userResolver(result) {
            const items = get(result, 'items', []).map(i => ({
                text: i.name,
                value: i.name,
            }));
            const finded = items.find(i => i.value === this.user);
            if (!finded) {
                this.user = get(items, '[0].value');
            }

            return items;
        },

        async submit() {
            let rules = [];


            if (this.mode === 'extend') {
                const response = await userService.getAuthRole({
                    params: {
                        level: this.identity,
                    } });
                const adminRule = (response.items || []).find(i => i.metadata.name === `${this.identity}-admin`);
                rules = get(adminRule, 'rules') || [];
            }

            await roleService.createRole({
                data: toRoleK8SObject(this.name, this.mode, this.identity, rules),
            });

            this.$emit('refresh');
            this.close();
        },
    },
};
</script>

<style>

</style>
