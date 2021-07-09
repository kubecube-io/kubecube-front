<template>
  <u-modal
    title="重置密码"
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
      <kube-form>
        <template v-if="step === 0">
          <kube-form-item>
            <b>请输入需要重置密码的账号</b>
          </kube-form-item>
          <validation-provider
            v-slot="{ errors }"
            name="AccountId"
            rules="required"
          >
            <kube-form-item
              label="账号"
              :message="errors && errors[0]"
              required
            >
              <u-input
                v-model="account.AccountId"
                size="huge"
                :class="$style.input"
                name="account"
                :color="errors && errors[0] ? 'error' : ''"
                placeholder="请输入账号"
                maxlength="128"
                maxlength-message="账号最多输入128个字符"
              >
                <i :class="$style.user_icon" />
                <i
                  v-if="account.AccountId"
                  :class="$style.close"
                  @click="account.AccountId = ''"
                />
              </u-input>
            </kube-form-item>
          </validation-provider>

          <kube-form-item>
            <u-submit-button
              :click="validateAccount.bind(this)"
            >
              <template slot-scope="scope">
                <u-linear-layout>
                  <u-button
                    color="primary"
                    :disabled="invalid || scope.submitting"
                    :icon="scope.submitting ? 'loading' : ''"
                    @click="scope.submit"
                  >
                    下一步
                  </u-button>
                  <u-button @click="close">
                    取消
                  </u-button>
                </u-linear-layout>
              </template>
            </u-submit-button>
          </kube-form-item>
        </template>

        <template v-if="step === 1">
          <validation-provider
            v-slot="{ errors }"
            name="oPassword"
            :rules="{
              required: true,
              lengthBetween: [8, 20],
              userPassword: true,
            }"
          >
            <password-input
              v-model="account.AccountPassword"
              label="原始密码"
              :message="errors && errors[0]"
            />
          </validation-provider>
          <validation-provider
            v-slot="{ errors }"
            name="oPassword"
            :rules="{
              required: true,
              lengthBetween: [8, 20],
              userPassword: true,
            }"
          >
            <password-input
              v-model="account.newPwd"
              label="新密码"
              :message="errors && errors[0]"
            />
          </validation-provider>
          <validation-provider
            v-slot="{ errors }"
            name="oPassword"
            :rules="{
              required: true,
              lengthBetween: [8, 20],
              userPassword: true,
              sameAs: {
                target: account.newPwd,
                key: '密码'
              }
            }"
          >
            <password-input
              v-model="account.confirmPwd"
              label="再次输入新密码"
              :message="errors && errors[0]"
            />
          </validation-provider>
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
                    下一步
                  </u-button>
                  <u-button @click="close">
                    取消
                  </u-button>
                </u-linear-layout>
              </template>
            </u-submit-button>
          </kube-form-item>
        </template>
      </kube-form>
    </validation-observer>
  </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/mixins';
import userService from 'kubecube/services/user';
import passwordInput from './password-input.vue';

export default {
    components: {
        passwordInput,
    },
    mixins: [ Modal ],
    data() {
        return {
            account: {
                AccountId: '',
                AccountPassword: '',
                newPwd: '',
                confirmPwd: '',
            },
            step: 0,
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
    },
    methods: {
        open() {
            Object.assign(this.account, {
                AccountId: '',
                AccountPassword: '',
            });
            this.step = 0;
            this.show = true;
        },
        async validateAccount() {
            const response = await userService.validateUser({
                pathParams: {
                    name: this.account.AccountId,
                },
            });
            if (response.isValid) {
                this.step++;
            } else {
                throw {
                    message: '账户名不存在',
                };
            }

        },
        async submit() {
            await userService.modifyPwd({
                data: {
                    originPassword: this.account.AccountPassword,
                    newPassword: this.account.newPassword,
                    userName: this.account.AccountId,
                },
            });

            this.show = false;
        },
    },
};
</script>

<style module>
.bg{
    background: url(./assets/bg.jpg) no-repeat;
    background-size: cover;
}
.root{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.login_form{
    float: none;
    width: 410px;
    height: 300px;
    margin: auto;
    padding-top: 30px;
    box-sizing: border-box;
    background: #fff;
    transition: box-shadow 0.2s;
    box-shadow: 0 0 10px 0 rgba(80,90,109,0.16);
}
.form{
    width: 325px;
    margin: 0 auto;
    padding: 0;
    line-height: 1;
}
.input[class]{
    width: 350px !important;
    padding: 0 30px !important;
}
input:focus{
    border-color: #4486e9;
    box-shadow: 0 0 2px #4486e9;
}
.err_icon[class]:before{
    font-size: 12px !important;
    vertical-align: -1px !important;
    font-weight: bold;
}
.user_icon:after{
    position: absolute;
    left: 5px;
    color: #ccc;
    font-size: 16px;
    icon-font: url(@micro-app/common/assets/user.svg);
}
.pwd_icon:after{
    position: absolute;
    left: 8px;
    color: #ccc;
    font-size: 16px;
    icon-font: url(@micro-app/common/assets/permission.svg);
}
.center{
    text-align: center;
}
.head > span > i{
    margin-left: 50px;
}
.close:after{
    position: absolute;
    right: 5px;
    icon-font: url(@micro-app/common/assets/delete.svg);
    color: #ccc;
    font-size: 16px;
}
.icons {
    position: absolute;
    right: 5px;
    display: inline-block;
    width: 45px;
}
.pwd_close:after{
    right: 25px;
}
.eyeclose:after{
    position: absolute;
    font-size: 18px;
    icon-font: url(@micro-app/common/assets/eyeclose.svg);
    right: 5px;
    color: #ccc;
}
.eye:after{
    position: absolute;
    font-size: 18px;
    icon-font: url(@micro-app/common/assets/eye.svg);
    right: 5px;
    color: #ccc;
}
.close:hover, .eye:hover, .eyeclose:hover{
    cursor: pointer;
}
.btn[class] {
    width: 100%;
}
.err_close{
    display: inline-block;
    width: 1.5em;
}
.err_close:after{
    /* position: absolute; */
    /* left: 0; */
    color: #ff5c57;
}
.link{
    padding-left: 5px;
}
.error_text{
    display: inline-block;
    width: 100%;
    text-align: center;
    color: #ff5c57;
}
</style>
