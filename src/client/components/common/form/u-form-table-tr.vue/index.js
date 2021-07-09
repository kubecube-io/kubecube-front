import uFromItems from '../u-form-items.vue/index';
import Validator from 'vusion-async-validator';

export default {
    name: 'u-form-table-tr',
    isField: true,
    props: {
        disabled: Boolean,
        topAlign: { type: Boolean, default: true }, // vertical-align: top;
        ignore: { type: Boolean, default: false }, // 是否忽略对应行的逻辑检查
        canBeEmpty: { type: Boolean, default: true }, // 是否允许空数组
        isEmpty: { type: Function }, // 判读是否是无效数组项的方法
        global: { type: Boolean, default: true }, // 是否向u-form抛出事件
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
        currentIndex() {
            if (this.table) {
                const index = this.table.trList.findIndex((item) => item === this);
                return index > -1 ? index : 0;
            } else
                return 0;
        },
        isEmptyValid() {
            return (this.table && this.table.trList.length === 1 && !this.canBeEmpty && this.isEmpty) ? !this.isEmpty() : true;
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
                if (!rules || !rules.length) {
                    this.dispatch('u-form-table', 'validate-item-tr', true);
                    this.global && this.dispatch('u-form', 'validate-item-vm', true);
                    return Promise.resolve();
                }

                // 对于单行多个输入框，使用this.name会重复，validator.validate()方法会报错
                // const name = this.name || 'field';
                const name = fieldVM.$attrs.name || 'field';
                const validator = new Validator({
                    [name]: rules,
                });

                return new Promise((resolve, reject) => {
                    // 这里的index为 u-inputs-** 相关组件当中，当前validate项的索引
                    // 在rules的声明中，通过（rule, value, callback, source, options）中的options.index, 可以获取到
                    validator.validate({ [name]: fieldVM.value }, { firstFields: true, index: this.currentIndex }, (errors, fields) => {
                        if (errors) {
                            !silent && (fieldVM.currentColor = 'error');
                            reject(errors);
                        } else
                            resolve();
                    });
                });
            });
            return Promise.all(validateAll).then(() => {
                this.state = this.isEmptyValid ? 'success' : 'error';
                if (!silent) {
                    this.currentMessage = this.message;
                }
                this.dispatch('u-form-table', 'validate-item-tr', true);
                this.global && this.dispatch('u-form', 'validate-item-vm');
            }).catch((errors) => {
                this.state = 'error';
                if (!silent) {
                    this.currentMessage = errors.length && errors[0].message;
                }
                // 给u-form-table发送的validate信息可以精确定位到是u-form下哪个子组件有问题
                this.dispatch('u-form-table', 'validate-item-tr', !errors);
                // 给u-form发送的validate信息可以使valid在u-form统一做
                this.global && this.dispatch('u-form', 'validate-item-vm', !errors);
            });
        },
    },
};
