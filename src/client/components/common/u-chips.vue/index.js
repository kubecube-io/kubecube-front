import { Field } from 'cloud-ui.vusion';

export default {
    name: 'u-chips',
    mixins: [Field],
    props: {
        placeholder: String,
        error: String,
        rules: Array,
        noSpace: Boolean,
        disabled: Boolean,
        allowEmpty: {
            type: Boolean,
            default: true,
        },
        value: Array,
        modifyValue: String, // 保持出错记录需要传递该值
        modifyValueIndex: Number,
        canBeEmpty: { type: Boolean, default: false },
    },
    data() {
        return {
            list: this.value,
            item: '',
            modifyItem: '',
            current: -1,
            max: 3,
            modifying: false,
            errMessage: '',
            focus: false,
        };
    },
    watch: {
        item(value) {
            // if (!value)
            //     return;
            this.validate(value);
        },
        modifyItem(value) {
            // if (!value)
            //     return;
            this.validate(value);
        },
        list(value, oldValue) {
            this.$emit('change', { value, oldValue });
            this.$emit('input', value);
        },
        value(value) {
            this.list = value;
        },
        modifying() {
            if (!this.modifying && !this.list.length && !this.allowEmpty)
                this.errMessage = this.error;
        },
    },
    computed: {
        // textarea每行的字数
        width() {
            const length = this.item.length;
            const width = length * 8.5 + 60;
            if (length <= 15)
                return 200;
            else
                return (width > 552 ? 552 : width);
        },
        height() {
            const row = Math.ceil(this.item.length / 66) || 1;
            return (row > 6 ? 6 : row) * 26;
        },
        maxHeight() {
            // 输入框的宽度
            const maxRows = (this.list.length / 4 > 6) ? 6 : (this.list.length / 4);
            return maxRows * 36;
        },
    },
    created() {
        window.addEventListener('keydown', this.onDocKeydown, false);
        // 是否需要保持错误信息
        if (this.modifyValue !== undefined) {
            this.modifyItem = this.modifyValue;
            this.current = +this.modifyValueIndex;
            this.modifying = true;
            this.onModifyBlur();
        }
    },
    destroyed() {
        window.removeEventListener('keydown', this.onDocKeydown, false);
    },
    methods: {
        /**
         * 进行验证的逻辑,validate是不关注当前事件是blur或input的
         * @param {string} value - 当前检测值
         * @param {string} [type='input'] - 事件种类
         * @return 错误信息，没有错误返回空字符
         */
        validate(value, type = 'input', list) {
            list = list || this.list;
            // 空值或已经有错误信息不检测
            if (!value && value !== '0' || this.errMessage) {
                this.emitValidate(value);
                return;
            }
            // 未通过检查的某项
            const errRule = this.rules.find((rule) => {
                // result为true表示通过了该条验证逻辑
                let result = false;
                if (!type.includes(rule.trigger))
                    return false;
                if (rule.type === 'method')
                    result = rule.options(value, rule, list);
                if (rule.type === 'is')
                    result = rule.options.test(value, list);
                if (rule.type === 'isNot')
                    result = !rule.options.test(value, list);

                return !result;
            });
            this.errMessage = errRule ? errRule.message : '';
            this.emitValidate(value);
        },
        onDocKeydown(event) {
            let { current, list, modifying, modifyItem } = this;

            if (current < 0)
                return;

            // tab 键
            if (event.which === 9) {
                event.preventDefault();
                if (modifying)
                    this.generate(modifyItem, true);
                else if (current === (list.length - 1))
                    this.$refs.cpInput.focus();
                else
                    this.onFocus(current + 1);
            }

            // enter键
            // 这里没有进行current的判断，是因为函数一开始就判断了
            if (event.which === 13) {
                this.modifying = true;
                this.modifyItem = list[current];
                list.splice(current, 1);
                this.$nextTick(() => {
                    this.getCpModifyInput().focus();
                });
            }
            // 键盘右键
            if (event.which === 39) {
                // 生成项失焦，编辑输入框focus
                if (current === list.length - 1) {
                    current = -1;
                    this.$refs.cpInput.focus();
                    // 向右切换生成项的聚焦
                } else
                    this.onFocus(current + 1);
            }
            // 键盘左键
            if (event.which === 37) {
                // 左边界，不再往左移动生成项聚焦
                if (current === 0)
                    return;
                // 向左切换生成项的聚焦
                this.onFocus(current - 1);
            }
            // backspace(win) == deleteItem(mac)
            if (event.which === 8) {
                this.deleteItem(current);
                current = -1;
                this.$refs.cpInput.focus();
            }
        },
        /**
         * 编辑框失焦
         */
        onModifyBlur(event) {
            this.generate(this.modifyItem, true);

            if (!this.errMessage)
                this.$refs.cpInput.focus();
        },
        /**
         * 整个大的框聚焦
         */
        onFieldClick(event) {
            event.stopPropagation();
            if (this.modifying)
                this.getCpModifyInput().focus();
            else
                this.$refs.cpInput.focus();
        },
        /**
         * 创建输入框的focus事件回调
         * @param {object} event - 包装事件对象
         */
        onInputFocus(event) {
            this.current = -1;
            this.modifying = false;
            this.focus = true;
        },
        /**
         * 创建输入框的blur事件回调
         * @param {object} event - 包装事件对象
         */
        onInputBlur(event) {
            this.generate(this.item);
            this.focus = false;

            // if (this.errMessage)
            //     this.$refs.cpInput && this.$refs.cpInput.focus();
        },
        /**
         * 编辑框的键盘事件
         * @param {object} event - 事件的包装对象
         */
        onKeydown(event) {
            event.stopPropagation();
            const { list, item } = this;

            this.errMessage = '';

            // enter键
            // 当只有一行的时候，静止默认enter键的默认操作
            if (event.which === 13 && this.height === 26)
                event.preventDefault();

            // tab 键
            // 当input内容为空，恢复tab的默认操作
            if (event.which === 9 && item !== '') {
                event.preventDefault();
                this.generate(item);
                this.$refs.cpInput.focus();
            }
            // 空格键 生成项
            if (event.which === 32 || event.which === 188) {
                // 生成项(满足相关要求)
                if (this.$refs.cpInput === document.activeElement && item) {
                    this.generate(item);
                    // 通过空格||逗号正常生成项之后，会残留字符。重置
                    if (!this.errMessage) {
                        setTimeout(() => {
                            this.item = '';
                        });
                    }
                }
            }
            // 左键 || backspace 切换focus项
            // 当前输入框内无内容，则focus最新的生成项
            // item == false && item !== '0'，说明item为空字符串或空格组成的字符串
            if ((event.which === 37 || event.which === 8) && item === '' && item !== '0') {
                this.item = '';
                this.onFocus(list.length - 1);
            }
        },
        /**
         * 修改输入框的键盘输入
         * @param {object} event - 包装事件对象
         */
        onModifyKeydown(event) {
            event.stopPropagation();
            const { current, modifyItem, modifying } = this;

            this.errMessage = '';

            // enter键
            // 禁止默认enter键的默认操作
            if (event.which === 13)
                event.preventDefault();

            // 空格键  生成项
            if (event.which === 32 || event.which === 188) {
                // 生成项(满足相关要求)
                if (this.getCpModifyInput() === document.activeElement && modifyItem) {
                    this.getCpModifyInput().blur();
                    if (!this.errMessage)
                        this.$refs.cpInput.focus();
                }
            }

            // tab 键
            // 当input内容为空，恢复tab的默认操作
            if (event.which === 9 && modifyItem !== '') {
                event.preventDefault();
                this.generate(modifyItem, true);
                this.getCpModifyInput().blur();
            }

            // backspace(win) == deleteItem(mac)
            if (event.which === 8) {
                if (modifying && modifyItem === '') {
                    this.modifying = false;
                    this.current = current === 0 ? 0 : current - 1;
                }
            }
        },
        /**
         * 聚焦某个生成项
         * @param {number} index - 生成项的索引
         * @param {object} event - 包装的event对象
         */
        onFocus(index, $event) {
            $event && $event.stopPropagation();
            this.modifying = false;
            this.$refs.cpInput.blur();
            this.current = index;
            // 这里是因为注册在document上的keydown事件，需要手动 $update
        },
        /**
         * 双击生成项，变为编辑状态
         * @param {number} index - 生成项的索引
         * @param {object} event - 包装的event对象
         */
        onDBLClick(index, event) {
            this.modifyItem = this.list[index];
            this.current = index;
            this.modifying = true;
            // 在list当中去除当前的编辑项
            this.list.splice(index, 1);
            this.$emit('input', this.list);
            this.$nextTick(() => {
                this.getCpModifyInput().focus();
            });
        },
        /**
         * 生成项（包括一次生成多个项）
         * @param {string} item - 生成项的内容
         * @param {boolean} [isModify=false] - 是否是编辑已生成项
         */
        generate(item, isModify = false) {
            // item == false，说明item为空字符串或空格组成的字符串
            if (item === '' && item !== '0') {
                if (isModify)
                    this.modifyItem = '';
                else
                    this.item = '';
                this.emptyValidate();

                return;
            }

            const hasSpace = !this.noSpace && item.indexOf(' ') !== -1;
            const hasComma = ~item.indexOf(',');
            // 单次生成多个项的数组
            // arrIndex是数组中出错的项的索引
            // str为生成项之外的错误部分的字符
            let itemArr = [], arrIndex = 0;
            if (hasSpace && hasComma)
                item = item.replace(/,/g, ' ');
            if (!hasSpace && !hasComma)
                itemArr = [item];
            else
                itemArr = item.split(hasSpace ? ' ' : ',').filter((item) => item);
            itemArr.every((itm, index) => {
                this.validate(itm, 'input+blur');
                if (this.errMessage)
                    return false;
                else {
                    // 编辑生成项
                    if (isModify) {
                        // 只有正确输入的情况下，才需要先删除之前的项
                        this.list.splice(this.current, 0, itm);
                    // 创建新生成项
                    } else
                        this.list.push(itm);
                    this.$emit('input', this.list);
                    arrIndex = index + 1;
                    return true;
                }
            });
            itemArr.splice(0, arrIndex);

            const str = itemArr.join(' ');
            isModify ? (this.modifyItem = str) : (this.item = str);
        },
        /**
         * 删除某项
         * @param {number} index - 某项的索引
         */
        deleteItem(index) {
            this.list.splice(index, 1);
            this.$emit('input', this.list);
            const item = this.modifying ? this.modifyItem : this.item;
            this.validate(item, 'input+blur');
            this.emptyValidate();
        },
        /**
         * 外部调用看数据是否合法
         */
        $checkValidity() {
            // 没有已创建项的更改
            // 没有错误信息
            // 创建输入框没有内容
            // 有正确输入项
            return !this.modifying && !this.errMessage && !this.item && (this.canBeEmpty ? true : this.list.length);
        },
        getCpModifyInput() {
            return this.$refs.cpModifyInput && (Array.isArray(this.$refs.cpModifyInput) ? this.$refs.cpModifyInput[0] : this.$refs.cpModifyInput);
        },
        emitValidate(value) {
            this.$emit('validate', {
                isValid: !!this.$checkValidity(),
                errMessage: this.errMessage,
                value,
                current: this.current === -1 ? this.list.length : this.current,
            });
        },
        emptyValidate(value = '') {
            if (!this.allowEmpty && !this.list.length) {
                this.errMessage = this.error;
                this.emitValidate(value);
            }
        },
    },
};
