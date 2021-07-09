import { Emitter, Link } from 'cloud-ui.vusion';
export default {
    name: 'u-crumb-item',
    parentName: 'u-crumb',
    mixins: [Link, Emitter],
    data: () => ({
        parentVM: undefined,
    }),
    computed: {
        showSeperator() {
            return this.parentVM.itemVMs.indexOf(this) > 0;
        },
        current() {
            return this.parentVM.itemVMs.slice(-1)[0] === this;
        },
    },
    created() {
        this.dispatch(this.$options.parentName, 'add-item-vm', this);
    },
    destroyed() {
        this.dispatch(this.$options.parentName, 'remove-item-vm', this);
    },
};
