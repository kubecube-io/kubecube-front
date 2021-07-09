<template>
    <u-modal @close="close" title="个人信息" ok-button="" cancel-button="" :visible.sync="show" size="huge">
        <u-form gap="large" :rules="rules" @validate="formValid = $event.valid">
            <u-form-item name="accountId" label="帐号" required>
                {{ model.AccountId }}
            </u-form-item>
            <u-form-item name="name" label="用户昵称" placement="bottom">
                <u-input size="large huge" v-model="model.UserName" maxlength="64" maxlength-message="不得超过64个字符"></u-input>
            </u-form-item>
            <u-form-item name="phone" label="手机" placement="bottom">
                <u-input size="large huge" v-model="model.Phone" maxlength="11"></u-input>
            </u-form-item>
            <u-form-item name="email" label="邮箱" placement="bottom">
                <u-input size="large huge" v-model="model.Email"></u-input>
            </u-form-item>
            <u-submit-button :click="submit.bind(this)" place="middle">
                <template slot-scope="scope">
                    <u-linear-layout>
                        <u-button color="primary" @click="scope.submit" :disabled="!formValid || scope.submitting" :icon="scope.submitting ? 'loading' : ''">确定</u-button>
                        <u-button @click="close">取消</u-button>
                    </u-linear-layout>
                </template>
            </u-submit-button>
        </u-form>
    </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/base/mixins';
import permissionService from '@micro-app/common/services/platform';
import cookie from '@micro-app/common/utils/handleCookie';
import _ from 'lodash';
export default {
    name: 'u-user-info-modal',
    mixins: [Modal],
    data() {
        return {
            model: {
                AccountId: '',
                UserName: '',
                Phone: '',
                Email: '',
            },
            rules: {
                phone: [
                    { type: 'string', pattern: /.{11,}/, trigger: 'input+blur', message: '请输入11位手机号' },
                ],
                email: [
                    { type: 'string', pattern: /[.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+/, trigger: 'input+blur', message: '请输入正确的邮箱格式' },
                ],
            },
            formValid: false,
        };
    },
    watch: {
        show(val) {
            val && this.getUser();
        },
    },
    methods: {
        getUser() {
            permissionService.getUser({
                AccountId: cookie.readCookie('accountId'),
            }).then((info) => {
                this.model = _.pick(info, _.keys(this.model));
            });
        },
        submit() {
            return permissionService.updateUserInfo(_.omit(this.model, ['AccountId'])).then(() => {
                this.$emit('update', this.model);
                this.close();
            });
        },
    },
};
</script>
