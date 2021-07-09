import { Emitter } from 'cloud-ui.vusion';
import Validator from 'vusion-async-validator';

export default {
    name: 'u-form-items',
    mixins: [Emitter],
    props: {
        name: String,
        label: String,
        title: String,
        rules: [Array, Object],
        message: String,
        required: { type: Boolean, default: false },
        labelSize: String,
        description: String,
    },
    data() {
        return {
            value: undefined,
            state: '',
            states: [],
            color: '',
            currentMessage: this.message,
            inputing: false,
            parentVM: undefined,
            fieldVMs: [],
            symbolValue: undefined,
            touched: true,
            dirty: true,
            firstError: '',
            valid: false,
        };
    },
    computed: {
        currentRules() {
            return this.rules || (this.parentVM && this.parentVM.rules && this.parentVM.rules[this.name]);
        },
        currentRequired() {
            return this.required || this.currentRules && Object.keys(this.currentRules).some((key) => this.currentRules[key].some((rule) => rule.required));
        },
        currentLabelSize() {
            return this.labelSize || (this.parentVM && this.parentVM.labelSize) || 'auto';
        },
    },
    created() {
        console.warn('[proto-ui]', '<u-form-items>之后将会废弃，请尽快通过组合<u-validater>组件的方式实现多input的输入内容校验');
        this.dispatch(($parent) => $parent.$options.isValidator || $parent.$options.isField, 'add-validator-vm', this);
        this.$on('add-field-vm', (fieldVM) => {
            fieldVM.validatorVM = this;
            this.value = fieldVM.value;
            this.fieldVMs.push(fieldVM);
            this.validate('submit', true).catch((err) => err);
        });
        this.$on('remove-field-vm', (fieldVM) => {
            fieldVM.validatorVM = undefined;
            this.fieldVMs.splice(this.fieldVMs.indexOf(fieldVM), 1);
        });
        this.$on('input', this.onInput);
        this.$on('change', this.onChange);
        this.$on('focus', this.onFocus);
        this.$on('blur', this.onBlur);
    },
    destroyed() {
        this.dispatch('u-form', 'remove-item-vm', this);
    },
    methods: {
        onInput(value) {
            this.inputing = true;
            this.value = value;
            this.$nextTick(() => {
                this.validate('input').catch((errors) => errors);
                this.inputing = false;
            });
        },
        onChange($event) {
            this.value = $event.value;
            !this.inputing && this.validate('submit', true).catch((errors) => errors);
        },
        onFocus() {
            this.color = this.state = 'focus';
            this.currentMessage = this.message;
        },
        onBlur() {
            this.color = this.state = '';
            this.$nextTick(() => this.validate('blur').catch((errors) => errors));
        },
        validate(trigger = 'submit', silent = false) {
            this.state = 'validating';
            const symbolValue = Symbol('validate');
            this.symbolValue = symbolValue;
            const validateAll = this.fieldVMs.filter((fieldVM) => fieldVM.$attrs.name).map((fieldVM, i) => {
                let rules = this.currentRules[fieldVM.$attrs.name];
                fieldVM.currentColor = undefined;
                rules = rules && rules.filter((rule) => (rule.trigger + '+submit').includes(trigger));
                if (!rules || !rules.length) {
                    this.onValidate(true);
                    return Promise.resolve();
                }

                const name = this.name || 'field';
                const validator = new Validator({
                    [name]: rules,
                });

                return new Promise((resolve, reject) => {
                    validator.validate({ [name]: fieldVM.currentValue }, { firstFields: true }, (errors, fields) => {
                        if (errors) {
                            !silent && (fieldVM.currentColor = 'error');
                            reject(errors);
                        } else
                            resolve();
                    });
                });
            });

            return Promise.all(validateAll).then(() => {
                if (this.symbolValue !== symbolValue)
                    return;
                this.state = 'success';
                if (!silent) {
                    // this.color = this.state;
                    this.currentMessage = this.message;
                }
                this.onValidate(true);
            }).catch((errors) => {
                if (this.symbolValue !== symbolValue)
                    return;
                this.state = 'error';
                if (!silent) {
                    // this.color = this.state;
                    this.currentMessage = errors[0].message;
                }
                this.onValidate(!errors);
                throw new Error(errors);
            });
        },
        onValidate(valid) {
            this.valid = valid;
            const $event = {
                valid,
                triggerValid: valid,
                touched: this.touched,
                dirty: this.dirty,
                firstError: this.firstError,
            };
            this.$emit('validate', $event, this);
            this.parentVM && this.parentVM.debouncedOnValidate();
        },
    },
};
