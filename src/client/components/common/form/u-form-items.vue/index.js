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
        this.dispatch('u-form', 'add-item-vm', this);
        this.$on('add-field-vm', (fieldVM) => {
            fieldVM.formItemVM = this;
            this.value = fieldVM.value;
            this.fieldVMs.push(fieldVM);
            this.validate('submit', true).catch((err) => err);
        });
        this.$on('remove-field-vm', (fieldVM) => fieldVM.formItemVM = undefined);
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
            const validateAll = this.fieldVMs.filter((fieldVM) => fieldVM.$attrs.name).map((fieldVM, i) => {
                let rules = this.currentRules[fieldVM.$attrs.name];
                fieldVM.currentColor = undefined;
                // rules = rules && rules.filter((rule) => (rule.trigger + '+submit').includes(trigger));
                rules = rules && rules.filter((rule) => (rule.trigger + '+submit').includes(trigger)).filter((item) => !item.ignore);
                if (!rules || !rules.length) {
                    this.dispatch('u-form', 'validate-item-vm', true);
                    return Promise.resolve();
                }

                // 对于单行多个输入框，使用this.name会重复，validator.validate()方法会报错
                // const name = this.name || 'field';
                const name = fieldVM.$attrs.name || 'field';
                const validator = new Validator({
                    [name]: rules,
                });

                return new Promise((resolve, reject) => {
                    validator.validate({ [name]: fieldVM.value }, { firstFields: true }, (errors, fields) => {
                        if (errors) {
                            !silent && (fieldVM.currentColor = 'error');
                            reject(errors);
                        } else
                            resolve();
                    });
                });
            });

            return Promise.all(validateAll).then(() => {
                this.state = 'success';
                if (!silent) {
                    // this.color = this.state;
                    this.currentMessage = this.message;
                }
                this.dispatch('u-form', 'validate-item-vm', true);
            }).catch((errors) => {
                this.state = 'error';
                if (!silent) {
                    // this.color = this.state;
                    this.currentMessage = errors[0].message;
                }
                this.dispatch('u-form', 'validate-item-vm', !errors);
            });
        },
    },
};
