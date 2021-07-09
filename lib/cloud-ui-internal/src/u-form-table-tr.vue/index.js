import uFromItems from '../u-form-items.vue/index';
import Validator from 'vusion-async-validator';

export default {
    name: 'u-form-table-tr',
    isField: true,
    props: {
        disabled: Boolean,
        ignore: { type: Boolean, default: false }, // 是否忽略对应行的逻辑检查
    },
    mixins: [uFromItems],
    created() {
        this.dispatch('u-form-table', 'add-item-tr', this);
    },
    destroyed() {
        this.dispatch('u-form-table', 'remove-item-tr', this);
    },
    data() {
        return {
            canRemove: false,
            table: undefined,
        };
    },
    computed: {
        dynamic() {
            return this.table ? this.table.dynamic : false;
        },
    },
    methods: {
        removeTr() {
            if (this.disabled)
                return;
            this.$emit('remove');
        },
        validate(trigger = 'submit', silent = false) {
            this.dispatch('u-form-table', 'change-item-tr', true);
            this.state = 'validating';
            const validateAll = this.fieldVMs.filter((fieldVM) => fieldVM.$attrs.name).map((fieldVM, i) => {
                let rules = this.currentRules[fieldVM.$attrs.name];
                fieldVM.currentColor = undefined;
                rules = rules && rules.filter((rule) => (rule.trigger + '+submit').includes(trigger)).filter((item) => !item.ignore);
                // rules = rules && rules.filter((rule) => (rule.trigger + '+submit').includes(trigger));
                if (!rules || !rules.length) {
                    this.dispatch('u-form-table', 'validate-item-tr', true);
                    this.dispatch('u-form', 'validate-item-vm', true);
                    return Promise.resolve();
                }

                // 对于单行多个输入框，使用this.name会重复，validator.validate()方法会报错
                // const name = this.name || 'field';
                const name = fieldVM.$attrs.name || 'field';
                const validator = new Validator({
                    [name]: rules,
                });

                const source = {};
                this.fieldVMs.map((vm) => [vm.$attrs.name, vm.value]).forEach(([key, value]) => {
                    source[key] = value;
                });

                return new Promise((resolve, reject) => {
                    validator.validate(source, { firstFields: true }, (errors, fields) => {
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
                this.dispatch('u-form-table', 'validate-item-tr', true);
                this.dispatch('u-form', 'validate-item-vm', true);
            }).catch((errors) => {
                this.state = 'error';
                if (!silent) {
                    // this.color = this.state;
                    this.currentMessage = errors[0].message;
                }
                this.dispatch('u-form-table', 'validate-item-tr', !errors);
                this.dispatch('u-form', 'validate-item-vm', !errors);
                throw new Error(errors);
            });
        },
    },
};
