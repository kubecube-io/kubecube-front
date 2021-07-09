<template>
  <div :class="$style.wrap">
    <span
      v-if="(message || errMsg)"
      :class="$style.error"
      :style="errorStyle || {}"
      :title="(message || errMsg)"
    >{{ (message || errMsg) }}</span>
    <slot name="tip" />
    <slot
      :submit="clickWrap"
      :submitting="submitting"
      :errMsg="errMsg"
    />
  </div>
</template>

<script>
import EventBus from '@micro-app/common/utils/message';

export default {
    name: 'USubmitButton',
    props: {
        click: {
            type: Function,
        },
        message: {
            type: String,
        },
        errorStyle: Object,
        autoFocus: Boolean,
        autoDismiss: Boolean,
        formRef: Function, // () => form
    },
    data() {
        return {
            errMsg: '',
            submitting: false,
            clickWrap: this.submit,
            form: undefined,
        };
    },
    created() {
        if (this.autoFocus) { this.form = this.getForm(this); }

        this.addEvent();
    },
    methods: {
        addEvent() {
            const hideError = () => { this.errMsg = ''; };
            EventBus.$on('hide-error', hideError);

            this.$on('hook:beforeDestroy', () => {
                EventBus.$off('hide-error', hideError);
            });
        },
        getForm(dom) {
            if (dom.$options.name === 'u-form') { return dom; } else if (dom.$parent) { return this.getForm(dom.$parent); }
            return undefined;
        },
        submit(params) {
            if (this.formRef) { this.form = this.formRef(); }

            if (this.autoFocus && this.form) {
                this.form.validate().then(() => {
                    this.onSubmit(params);
                }).catch(result => {
                    if (result instanceof Array) {
                        let index = 0;
                        for (let i = 0, len = result.length; i < len; i++) {
                            if (result[i]) {
                                index = i;
                                break;
                            }
                        }
                        const item = this.form.validatorVMs[index].$el;
                        item && item.scrollIntoView();
                    }
                });
            } else { this.onSubmit(params); }
        },
        onSubmit(params) {
            if (this.submitting) {
                return;
            }
            this.submitting = true;
            this.errMsg = '';
            this.click(params).then(data => {
                this.submitting = false;
                return data;
            }, (err = {}) => {

                this.submitting = false;
                if (Array.isArray(err)) {
                    this.errMsg = (err.filter(item => item.message)[0] || {}).message;
                } else {
                    this.errMsg = err.message || err.Message || err.reason;
                }

                if (this.autoDismiss) {
                    clearTimeout(this.__iTimer);
                    this.__iTimer = setTimeout(() => {
                        this.errMsg = '';
                    }, 5000);
                }
                throw err;
            });
        },
    },
};
</script>

<style module>
.wrap {
    position: relative;
    /* min-width: 500px; */
}
.wrap[place='middle']{
    text-align: center;
}
.wrap[place='left']{
    text-align: left;
    min-width: 500px;
}
.wrap[place='right']{
    text-align: right;
}
.error {
    position: absolute;
    display: inline-block;
    height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    top: -23px;
    left: 0px;
    font-size: 12px;
    color: #ff867f;
}
.error[error='middle'] {
    top: -26px;
    left: 50%;
    transform: translate(-50%, 0);
}
</style>
