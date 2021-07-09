import { Field } from 'proto-ui.vusion';
import { deepCopy } from './base/utils/index';
import _ from 'lodash';
import i18n from './i18n';

const MultiFilter = {
    name: 'u-multi-filter',
    i18n,
    props: {
        data: Array,
        readonly: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        width: { type: [ String, Number ], default: '250' },
        value: Array,
        field: {
            type: String,
            default: 'text',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        filter: {
            type: Boolean,
            default: false,
        },
        max: {
            type: [ Number, String ],
            default: 1000,
        },
        filterMethod: Function,
        placeholder: {
            type: String,
            default() { return this.$t('selectText'); },
        },
        size: String,
        pattern: {
            type: String,
            default: 'normal',
        },
        newData: Array,
    },
    mixins: [ Field ],
    data() {
        return {
            currentValue: _.cloneDeep(this.value),
            open: false,
            optionsData: this.initOptionsData(this.value),
            selFlag: this.initSelFlag(this.value),
            closeable: true,
            options: {
                modifiers: {
                    computeStyle: {
                        gpuAcceleration: false,
                    },
                    preventOverflow: {
                        boundariesElement: 'body',
                    },
                },
            },
            placement: 'bottom',
            inputLength: 100,
            query: '',
            compositionInputing: false,
            copyOptionsData: this.initOptionsData(this.value),
            open1: false,
            all: true,
        };
    },

    computed: {
        selItems() {
            const selItem = [];
            this.currentValue.forEach(item => {
                const isOptions = this.copyOptionsData.some(option => {
                    if (option.value === item) {
                        selItem.push(option);
                        return true;
                    }
                    return false;
                });
                if (!isOptions) {
                    selItem.push({
                        [this.field]: item,
                        value: item,
                    });
                }
            });
            return selItem;
        },
        inputStyle() {
            const style = {};
            if (this.filter) {
                if (this.currentValue.length === 0) { style.width = '100%'; } else { style.width = `${this.inputLength}px`; }
            }
            return style;
        },
        showPlaceholder() {
            if (this.currentValue.length === 0) { return this.placeholder; }
            return '';
        },
    },
    methods: {
        shift(count) {
            let selectedIndex = -1;
            const hovered = this.optionsData.some((item, index) => {
                if (item.hovered) {
                    selectedIndex = index;
                    return true;
                }
                return false;
            });
            if (!hovered) {
                // 如果没有处于hover状态的元素 判断是否有处于selected的元素，有的话 shfit的selectedIndex就是他的索引
                this.optionsData.some((item, index) => {
                    if (item.selected) {
                        selectedIndex = index;
                        return true;
                    }
                    return false;
                });
            }
            if (count > 0) {
                if (selectedIndex + count === this.optionsData.length) { selectedIndex = -1; }
                this.handleShift(selectedIndex, count);
            } else if (count < 0) {
                if (selectedIndex === -1 || selectedIndex + count < 0) { selectedIndex = this.optionsData.length; }
                this.handleShift(selectedIndex, count);
            }
        },
        handleShift(selectedIndex, count) {
            for (let i = selectedIndex + count; i >= 0; i--) {
                const itemVM = this.optionsData[i];
                if (!itemVM.disabled && !itemVM.selected) {
                    itemVM.hovered = true;
                    this.optionsData.forEach((item, index) => {
                        if (index !== i) { item.hovered = false; }
                    });
                    this.$emit('shift', {
                        selectedIndex,
                        selectedVM: itemVM,
                        value: itemVM.value,
                    });
                    this.ensureSelectedInView();
                    break;
                }
            }
        },
        onToggle($event) {
            this.open = $event.open;
            // 需要在popper层关闭之后重置OptionsData 确保下次进来的数据是全部数据
            if (!$event.open) {
                this.optionsData = this.initOptionsData(this.currentValue);
                this.query = '';
                this.all = true;
            }
            this.$emit('toggle', $event);
        },
        select(event, index) {
            const obj = JSON.parse(JSON.stringify(this.optionsData));
            this.query = obj[index].text + '=';
            this.all = false;
            /**
             * @event select 选中列表项时触发
             * @property {object} sender 事件发送对象
             * @property {object} selected 选中后的列表对象
             * @property {String} value 选中后的列表对象的值
             */
            this.$emit('sel', {
                value: obj[index].text,
                tags: this.currentValue,
            });
        },
        select1(event, index) {
            if (this.selItems.length > this.max) { this.toggle(false); }
            const obj = JSON.parse(JSON.stringify(this.newData));
            this.query = this.query + obj[index].text;
            this.all = true;
            if (this.query) {
                // 这种模式允许创建options中没有的条目
                const createFlag = this.checkCreate();
                if (!createFlag && !this.currentValue.includes(this.query)) {
                    this.currentValue.push(this.query);
                    this.resetOptions();
                    this.toggle(false);
                }
                this.query = '';
            }
            this.$nextTick(() => this.$refs.popper.update());
            this.$emit('choose', {
                value: this.selItems,
            });
        },
        checkCreate() {
            this.optionsData.some((item, index) => {
                if (item[this.field] === this.query) {
                    if (!item.selected) {
                        this.currentValue.push(item.value);
                        item.lastSelected = true;
                        this.resetOptions(index);
                    }
                    return true;
                }
                return false;
            });
        },
        initSelFlag(value) {
            const currentValue = value || this.currentValue;
            if (currentValue.length === 0) { return false; }
            return true;
        },
        initOptionsData(value, data) {
            const currentValue = value || this.currentValue;
            data = data || this.data;
            const optionsData = deepCopy([], data);
            optionsData.forEach(item => {
                if (currentValue.indexOf(item.value) !== -1) { item.selected = true; } else { item.selected = false; }
                this.$set(item, 'hovered', false);
                this.$set(item, 'lastSelected', false);
            });
            return optionsData;
        },
        close(index) {
            this.currentValue.splice(index, 1);
            // 新增模式下删除也需要处理下options中的数据
            this.$nextTick(() => this.$refs.popper.update());
            this.$emit('close', {
                index,
                value: _.cloneDeep(this.selItems),
            });
        },
        focus() {
            if (this.filter) { this.$refs.input.focus(); }
        },
        onInput(e) {
            if (!this.compositionInputing) {
                const query = e.target.value.trim();
                this.inputLength = this.$refs.input.value.length * 7 + 20;
                this.$nextTick(() => this.$refs.popper.update());
                if (query === '') { this.optionsData = []; } else if (this.query.length === 1) {
                    if (this.filterMethod) { this.optionsData = this.filterMethod(this.copyOptionsData, query); } else {
                        this.optionsData = this.handletOptionData(query);
                    }
                } else if (this.filterMethod) { this.optionsData = this.filterMethod(this.copyOptionsData, query); } else {
                    this.optionsData = this.handletOptionData(query);
                }

                if (!query && !this.optionsData.length) {
                    this.$refs.popper.toggle(false);
                    this.optionsData = this.initOptionsData();
                } else if (!this.open) { this.$refs.popper.toggle(true); }
            }
        },
        handletOptionData(query) {
            return this.copyOptionsData.filter(item => {
                if (item[this.field].indexOf(query) !== -1) { return true; }
                return false;
            });
        },
        inputDelete() {
            if (this.query === '' && this.filter) { this.currentValue.splice(this.currentValue.length - 1, 1); }
        },
        inputClick() {
            this.$refs.popper.toggle(true);
        },
        toggle(open) {
            this.$refs.popper && this.$refs.popper.toggle(open);
        },
        // enter 按键操作处于hover状态的选中 处于selected状态 取消选中
        enterSelected() {
            this.all = true;
            if (this.query && this.pattern === 'create') {
                // 这种模式允许创建options中没有的条目
                const createFlag = this.checkCreate();
                if (!createFlag && !this.currentValue.includes(this.query)) {
                    if (this.query.indexOf('=') > -1) {
                        const arr = this.query.split('=');
                        this.query = arr[0] + '=' + arr[arr.length - 1];
                    }
                    this.currentValue.push(this.query);
                    this.resetOptions();
                    this.toggle(false);
                }
                this.query = '';
            }
            this.$nextTick(() => this.$refs.popper.update());
            this.$emit('enter', {
                value: this.selItems,
            });
        },
        ensureSelectedInView(natural) {
            // 确保有滚动条的情况下 选择项是视野内
            let selectedIndex;
            const hovered = this.optionsData.some((item, index) => {
                if (item.hovered) { selectedIndex = index; }
                return item.hovered;
            });
            if (!hovered) { return false; }

            const selectedEl = this.$refs.listItem[selectedIndex];
            const parentEl = selectedEl.parentElement;
            if (parentEl.scrollTop < selectedEl.offsetTop + selectedEl.offsetHeight - parentEl.clientHeight) {
                if (natural) { parentEl.scrollTop = selectedEl.offsetTop - selectedEl.offsetHeight; } else { parentEl.scrollTop = selectedEl.offsetTop + selectedEl.offsetHeight - parentEl.clientHeight; }
                if (selectedIndex === this.optionsData.length - 1) {
                    setTimeout(() => (parentEl.scrollTop = parentEl.scrollHeight - parentEl.clientHeight), 200);
                }
            }
            if (parentEl.scrollTop > selectedEl.offsetTop) { parentEl.scrollTop = selectedEl.offsetTop; }
        },
        resetOptions(index = -1) {
            this.optionsData.forEach((item, sindex) => {
                if (sindex !== index) { item.lastSelected = false; }
            });
        },
    },
    watch: {
        open(newValue) {
            const index = MultiFilter.opens.indexOf(this);
            if (newValue && index < 0) { MultiFilter.opens.push(this); } else if (!newValue && index > -1) { MultiFilter.opens.splice(index, 1); }
        },
        data() {
            this.copyOptionsData = this.optionsData = this.initOptionsData(this.value);
        },
        value(newValue) {
            this.currentValue = newValue;
            this.selFlag = this.initSelFlag();
        },
        currentValue(newValue) {
            this.selFlag = this.initSelFlag();
            if (!newValue.length && !this.query) { this.optionsData = this.initOptionsData(); }
            this.$emit('change', {
                value: newValue,
            });
            this.$emit('input', newValue);
        },
    },
};

MultiFilter.opens = [];

export default MultiFilter;
