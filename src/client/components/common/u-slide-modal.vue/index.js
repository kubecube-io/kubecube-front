import { Modal } from 'cloud-ui.vusion';

export default {
    name: 'u-slide-modal',
    extends: Modal,
    props: {
        maskClose: { type: Boolean, default: true },
        noMask: {
            type: Boolean,
            default: false,
        },
        header: Boolean,
    },
    data() {
        return {
            dialogVisible: false,
        };
    },
    watch: {
        currentVisible(val) {
            if (!val)
                this.dialogVisible = val;
        },
    },
    methods: {
        showMask() {
            this.dialogVisible = true;
        },
        hideMask() {
            let cancel = false;
            this.$emit('before-close', {
                preventDefault: () => cancel = true,
            });
            if (cancel)
                return;

            this.currentVisible = false;

            this.$emit('update:visible', false);
            this.$emit('close');
        },
        close() {
            this.currentVisible = true;
            this.dialogVisible = false;
        },
    },
};
