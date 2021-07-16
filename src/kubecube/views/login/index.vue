<template>
  <div :class="[$style.root, $style.bg]">
    <div :class="$style.login_form">
      <div :class="$style.form">
        <u-tabs v-model="account.LoginType">
          <u-tab
            title="普通登录"
            value="normal"
          />
        <!-- <u-tab
            :hidden="!ldapFlag"
            title="LDAP"
            value="ldap"
        /> -->
        </u-tabs>
        <validation-observer
          ref="observer"
          v-slot="{ invalid }"
        >
          <kube-form>
            <validation-provider
              v-slot="{ errors }"
              name="AccountId"
              rules="required"
            >
              <kube-form-item
                muted="no"
                style="width: 100%;"
                field-size="full"
                layout="none"
                :message="errors && errors[0]"
                placement="bottom"
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
                muted="no"
                style="width: 100%;"
                field-size="full"
                layout="none"
                :message="errors && errors[0]"
                placement="bottom"
              >
                <u-input
                  v-model="account.AccountPassword"
                  size="huge"
                  :class="$style.input"
                  :color="errors && errors[0] ? 'error' : ''"
                  name="password"
                  :type="pwdFlag ? 'password' : 'text'"
                  placeholder="请输入密码"
                  maxlength="128"
                  maxlength-message="密码最多输入128个字符"
                  @keyup.enter="login"
                >
                  <i :class="$style.pwd_icon" />
                  <i
                    v-if="account.AccountPassword"
                    :class="[$style.close, $style.pwd_close]"
                    @click="account.AccountPassword = ''"
                  />
                  <i
                    :class="pwdFlag ? $style.eye : $style.eyeclose"
                    @click="pwdFlag = !pwdFlag"
                  />
                </u-input>
              </kube-form-item>
            </validation-provider>
            <kube-form-item
              muted="no"
              style="width: 100%;"
              field-size="full"
              layout="none"
              placement="right"
            >
              <u-link
                style="float: right;"
                @click="$refs.password.open()"
              >
                重置密码
              </u-link>
            </kube-form-item>
            <kube-form-item
              muted="no"
              style="width: 100%;"
              field-size="full"
              layout="none"
              placement="bottom"
            >
              <u-button
                color="primary"
                size="large"
                :class="$style.btn"
                :disabled="invalid || loadingSubmit"
                @click="login"
              >
                登录
              </u-button>
              <span :class="$style.error_text">{{ errMsg }}</span>
            </kube-form-item>
          </kube-form>
          <!-- <u-linear-layout
            v-if="openIdFlag || winADFlag"
            type="flex"
            justify="center"
          >
            使用<u-link
              v-if="openIdFlag"
              :class="$style.link"
              @click="openIdLogin"
            >
              OpenID 登录
            </u-link>
            <u-link
              v-if="winADFlag"
              :href="windowAdUrl"
            >
              Windows AD域登录
            </u-link>
          </u-linear-layout> -->
        </validation-observer>
      </div>
    </div>
    <password-dialog ref="password" />
  </div>
</template>

<script>
// import { cloneDeep } from 'lodash';
import { sync } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import { setItem, getItem, removeItem } from 'kubecube/utils/persistant';
import passwordDialog from './password.vue';
export default {
    metaInfo: {
        title: 'kubecube',
        titleTemplate: '%s - Login',
    },
    components: {
        passwordDialog,
    },
    data() {
        return {
            account: {
                LoginType: 'normal',
                AccountId: '',
                AccountPassword: '',
            },
            errMsg: '',
            pwdFlag: true,
            pwdErrFlag: false,
            errMessage: '',
            showEYE: true,
            isError: false,
            loadingSubmit: false,
        };
    },
    computed: {
        user: sync('scope/user'),
    },
    methods: {
        async login() {
            try {
                const response = await userService.login({
                    data: {
                        loginType: 'normal',
                        name: this.account.AccountId,
                        password: this.account.AccountPassword,
                    },
                });
                const account = {
                    AccountId: response.metadata.name,
                    AccountDisplayName: response.spec.displayName,
                };

                setItem('user', JSON.stringify(account));
                const lastLocation = getItem('lastlocation');
                this.user = account;
                if (lastLocation) {
                    this.$router.push(JSON.parse(lastLocation));
                } else {
                    this.$router.push('/');
                }
                removeItem('lastlocation');

            } catch (error) {
                if (error.message) {
                    this.errMsg = error.message;
                }
            }
            // }
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
