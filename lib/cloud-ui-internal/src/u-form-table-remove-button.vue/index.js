export default {
    name: 'u-form-table-remove-button',
    methods: {
        click() {
            if (this.disabled)
                return;
            this.$emit('click');
        },
    },
};
