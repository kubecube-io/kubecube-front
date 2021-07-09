<template>
  <kube-form-item
    :label="label"
    :message="message"
    required
  >
    <u-input
      v-model="model"
      size="huge"
      :class="$style.input"
      :color="message ? 'error' : ''"
      :type="pwdFlag ? 'password' : 'text'"
      placeholder="请输入密码"
      maxlength="128"
      maxlength-message="密码最多输入128个字符"
    >
      <i :class="$style.pwd_icon" />
      <i
        v-if="model"
        :class="[$style.close, $style.pwd_close]"
        @click="model = ''"
      />
      <i
        :class="pwdFlag ? $style.eye : $style.eyeclose"
        @click="pwdFlag = !pwdFlag"
      />
    </u-input>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        label: String,
        message: String,
    },
    data() {
        return {
            pwdFlag: true,
        };
    },
};
</script>

<style module>
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
