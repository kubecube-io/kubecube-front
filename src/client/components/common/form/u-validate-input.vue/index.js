import { Input } from 'cloud-ui.vusion';
import Validator from '@micro-app/common/utils/validator';

// 具有单独validate功能的u-input组件
export default {
    name: 'u-validate-input',
    mixins: [Input],
    props: {
        rules: Array,
        name: String,
    },
    data() {
        return {
            validator: null,
            valid: false,
            currentMessage: 'test',
        };
    },
    created() {
        // name是必填的属性了
        if (!this.name)
            throw new Error('请指定input的name属性');

        this.validator = new Validator({
            key: this.name,
            rules: this.rules,
        });
    },
    methods: {
        onInput(e) {
            if (!this.compositionInputing) {
                this.currentValue = e.target.value;
                this.$emit('input', this.currentValue);
                this.$emit('update:value', this.currentValue);
                this.validate(this.currentValue);
            }
        },
        onBlur(e) {
            this.validate(this.currentValue);
            this.$emit('blur', e);
        },
        onCompositionEnd(e) {
            // 中文输入的时候，会先触发onInput事件，再触发此事件，导致不能捕捉到中文输入
            // 因此需要特殊处理，此时compositionInputing值为true
            this.compositionInputing = false;
            this.currentValue = e.target.value;
            this.$emit('input', this.currentValue);
            this.$emit('update:value', this.currentValue);
            this.validate(this.currentValue);
        },
        validate(value) {
            value = value || this.currentValue;
            // todo：支持多项的validate
            // errors为对应字段的哪条rule报错
            this.validator.validate(value, (errors, fields) => {
                this.currentColor = errors ? 'error' : '';
                this.currentMessage = errors && errors[0].message;

                this.$emit('validate', {
                    valid: !errors,
                    message: errors,
                });
            });
        },
    },
};

