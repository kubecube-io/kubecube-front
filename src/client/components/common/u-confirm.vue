<template>
    <u-modal :class="$style.root" :visible.sync="show" :title="title" @close="close" size="auto">
        <u-status-icon :class="$style.status" :name="type" :hasSub="hasSub"></u-status-icon>
        <div :class="$style.text" :hasSub="hasSub">
            <div :class="$style.content">{{ content }}</div>
            <div v-if="subContent" :class="$style.subContent">{{ subContent }}</div>
            <div v-if="subContentHtml" :class="$style.subContentHtml" v-html="subContentHtml"></div>
        </div>
        <div slot="foot" style="position: relative;">
            <span :class="['f-toe', $style.error]" v-if="(message || errMsg)" :title="(message || errMsg)">{{ (message || errMsg) }}</span>
            <u-linear-layout>
                <u-button :color="isCancelPrimary ? '' : 'primary'" @click="submit" :disabled="submitting" :icon="submitting ? 'loading' : ''">{{ okText }}</u-button>
                <u-button v-show="showCancel" :color="isCancelPrimary ? 'primary' : ''" @click="close">{{ cancelText }}</u-button>
            </u-linear-layout>
        </div>
    </u-modal>
</template>
<style module>
.root[class] {
    /* 下拉框的z-index太大，为1065,u-modal的z-index原本为1000 */
    z-index: 1111;
}
.status {vertical-align: middle; display: inline-block;}
.status[hasSub = true] {vertical-align: top}
.status span{font-size: 40px !important;}

.text {
    display: inline-block;
    max-width: 360px;
    text-align: left;
    vertical-align: middle;
    word-break: break-all;
}

.text[hasSub = true] {vertical-align: top;}

.content{
    line-height: 24px;
    font-size: 20px;
    color: #333;
    text-align: left;
}

.subContent{
    line-height: 24px;
    font-size: 14px;
    color: #666;
    margin-top: 10px;
}

.subContentHtml {
    margin: 20px 0 0 -50px;
    word-break: break-all;
    max-height: 200px;
    overflow: scroll;
}

.submit {
    margin-left: -40px;
    margin-top: 20px;
    min-width: 0 !important;
}

.error {
    position: absolute;
    display: inline-block;
    height: 20px;
    overflow: hidden;
    top: -23px;
    left: 0px;
    font-size: 12px;
    color: #ff867f;
    width: 100%;
}
</style>
<script>
import { Modal } from '@micro-app/common/base/mixins';

export default {
    name: 'u-confirm',
    mixins: [ Modal ],
    props: {

    },
    data() {
        return {
            type: 'warning',
            title: '提示',
            content: '',
            subContent: '',
            subContentHtml: '',
            isCancelPrimary: true,
            showCancel: true, // 默认展示取消按钮
            ok: null,
            cancel: null,
            clickWrap: this.submit,
            submitting: false,
            errMsg: '',
            okText: '确定',
            cancelText: '取消',
            message: '',
        };
    },
    computed: {
        hasSub() {
            return !!this.subContent;
        },
    },
    watch: {
        show(val) {
            if(!val){
                this.errMsg = '';
                this.message = '';
            }
        }
    },
    created() {
    },
    methods: {
        open(options) {
            this.show = true;
            Object.assign(this, options);
        },
        // 覆盖 mixins - modal 中的close
        close() {
            this.cancel && this.cancel();
            this.show = false;
        },
        submit() {
            if (this.submitting) {
                return;
            }
            this.submitting = true;
            this.errMsg = '';
            this.ok().then((data) => {
                this.submitting = false;
                this.show = false;
                return data;
            }, (err) => {
                // todo： 错误提示文案展示
                this.submitting = false;
                if (Array.isArray(err)) {
                    this.errMsg = (err.filter((item) => item.msg)[0] || {}).msg;
                } else {
                    this.errMsg = err.message || err.Message || err.reason;
                }
            });
        },
    },
}
</script>
