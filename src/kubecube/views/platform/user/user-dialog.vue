<template>
  <u-modal
    :title="isEdit ? '编辑用户' : (isPwd ? '修改密码' : '新增用户')"
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
          v-if="!isPwd && !isEdit"
          v-slot="{ errors }"
          name="Name"
          rules="required"
        >
          <kube-form-item
            label="登录账号"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.name"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
        <kube-form-item
          label="用户名"
        >
          <u-input
            v-model="model.displayName"
            size="normal huge"
          />
        </kube-form-item>

        <!-- <validation-provider
          v-if="isEdit"
          v-slot="{ errors }"
          name="Name"
          rules="required"
        >
          <kube-form-item
            label="用户名"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.displayName"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider> -->

        <validation-provider
          v-slot="{ errors }"
          name="Password"
          :rules="{
            required: true,
            lengthBetween: [8, 20],
            userPassword: true,
          }"
        >
          <kube-form-item
            v-if="!isEdit"
            label="密码"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.password"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-if="!isPwd"
          v-slot="{ invalid: ivd, errors }"
          name="Phone"
          rules="phone"
        >
          <kube-form-item
            label="电话"
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.phone"
              size="normal huge"
              :color="ivd ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>

        <validation-provider
          v-if="!isPwd"
          v-slot="{ invalid: ivd, errors }"
          name="Email"
          rules="email"
        >
          <kube-form-item
            label="Email"
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.email"
              size="normal huge"
              :color="ivd ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
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
import { Modal } from '@micro-app/common/mixins';
import { pick, omit, clone } from 'lodash';
import userService from 'kubecube/services/user';
export default {
    mixins: [ Modal ],
    data() {
        return {
            type: 'create',
            model: this.genModel(),
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
        isPwd() {
            return this.type === 'pwd';
        },
    },
    methods: {
        open(target, password) {
            if (target) {
                this.model = clone(target);
                this.type = 'edit';
                this.onlyPWD = false;
                if (password) {
                    this.model.password = '';
                    this.type = 'pwd';
                }
            } else {
                this.model = this.genModel();
                this.type = 'create';
                this.onlyPWD = false;
            }
            this.show = true;
        },
        genModel() {
            return {
                name: '',
                displayName: '',
                password: '',
                phone: '',
                email: '',
            };
        },
        async submit() {
            try {
                if (!this.isEdit && !this.isPwd) {
                    await userService.createUser({
                        data: {
                            metadata: {
                                name: this.model.name,
                            },
                            spec: omit(this.model, [ 'name' ]),
                        },
                    });
                } else {
                    const spec = this.type === 'pwd' ?
                        pick(this.model, [ 'password' ]) :
                        pick(this.model, [ 'displayName', 'phone', 'email' ]);

                    await userService.modifyUser({
                        pathParams: {
                            user: this.model.name,
                        },
                        data: {
                            spec,
                        },
                    });
                }
                this.show = false;
                this.$emit('refresh');
            } catch (error) {
                if (error.response) {
                    this.isError = error.response.data.message;
                }
            }

        },
    },
};
</script>

<style>

</style>
