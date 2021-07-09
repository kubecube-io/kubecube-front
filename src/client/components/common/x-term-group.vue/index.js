import { Tabs } from 'cloud-ui.vusion';

export default {
    name: 'x-term-group',
    mixins: [Tabs],
    props: {
        // value: null,
        // readonly: { type: Boolean, default: false },
        // disabled: { type: Boolean, default: false },
        blank: { type: Boolean, default: false }, // 点击扩大是否新开页面
        to: [Object, String],
        show: false,
        isFullScreen: Boolean,
        maximized: { type: Boolean, default: false }, // 如果是从父组件传入为true，则后续的dbclock不允许改变currentMaximized的值
    },
    data() {
        return {
            minimized: false,
            currentMaximized: this.maximized,
        };
    },
    watch: {
        maximized() {
            this.currentMaximized = this.maximized;
        },
        minimized(value) {
            this.$emit('minimize', !!value);
        },
    },
    created() {
        this.$on('exit-item-vm', (itemVM) => {
            this.exit();
        });
    },
    methods: {
        maximize() {
            (!this.isFullScreen && !this.blank) && (this.currentMaximized = !this.currentMaximized);
        },
        close(itemVM) {
            if (this.readonly || this.disabled || itemVM.disabled)
                return;

            const oldValue = this.value;

            let cancel = false;
            this.$emit('before-close', {
                value: itemVM && itemVM.value,
                oldValue,
                itemVM,
                preventDefault: () => cancel = true,
            });
            if (cancel)
                return;

            itemVM.parentVM = undefined;
            const index = this.itemVMs.indexOf(itemVM);
            this.itemVMs.splice(index, 1);

            // 这里emit的名称为close会导致浏览器崩溃。。。
            cancel = false;
            this.$emit('closeItem', {
                value: itemVM && itemVM.value,
                oldValue,
                itemVM,
                preventDefault: () => cancel = true,
            });
            if (cancel)
                return;

            if (this.selectedVM === itemVM) {
                this.selectedVM = this.itemVMs[index] || this.itemVMs[index - 1];
                const value = this.selectedVM && this.selectedVM.value;
                this.$emit('input', value);
                this.$emit('update:value', value);
            }
        },
        closeAll() {
            this.$confirm({
                title: '提示',
                // content: '关闭后将断开所有与服务器的连接',
                content: '是否断开与服务器的连接？',
                ok: () => Promise.resolve(this.$emit('closeAll')),
            });
        },
        // 已经正常断开链接，只能关闭弹窗
        exit() {
            this.$confirm({
                title: '提示',
                content: '连接已断开',
                showCancel: false,
                isCancelPrimary: false,
                ok: () => Promise.resolve(this.$emit('exit')),
                cancel: () => Promise.resolve(this.$emit('exit')),
            });
        },
    },
};
