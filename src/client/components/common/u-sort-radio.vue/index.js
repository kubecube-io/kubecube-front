import { Radio } from 'cloud-ui.vusion';

export default {
    name: 'u-sort-radio',
    parentName: 'u-sort-radios',
    extends: Radio,
    data() {
        return {
            activeType: -1, // -1 降序，1 升序
            prevSelected: false,
        };
    },
    methods: {
        select() {
            if (this.readonly || this.disabled)
                return;
            if (this.parentVM && (this.parentVM.readonly || this.parentVM.disabled))
                return;

            let cancel = false;
            this.$emit('before-select', {
                label: this.label,
                itemVM: this,
                preventDefault: () => cancel = true,
            });
            if (cancel)
                return;
            this.prevSelected = this.selected;
            this.parentVM && this.parentVM.select(this);
            if (this.prevSelected) {
                this.activeType = -this.activeType;
                this.parentVM.$emit(this.activeType > 0 ? 'up' : 'down');
            } else {
                this.activeType = -1;
                this.parentVM.$emit('down');
            }
        },
    },
};
