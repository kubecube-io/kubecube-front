import cookie from '@micro-app/common/utils/handleCookie';
export default {
    name: 'u-crumb',
    childName: 'u-crumb-item',
    props: {
        absolute: { type: Boolean, default: false },
    },
    data: () => ({
        itemVMs: [],
        code: undefined,
    }),
    created() {
        this.$on('add-item-vm', (itemVM) => {
            itemVM.parentVM = this;
            this.itemVMs.push(itemVM);
        });
        this.$on('remove-item-vm', (itemVM) => {
            itemVM.parentVM = undefined;
            this.itemVMs.splice(this.itemVMs.indexOf(itemVM), 1);
        });
    },
};
