export default {
    name: 'u-form-table-add-button',
    props: {
        isContainer: Boolean,
    },
    methods: {
        click() {
            this.$emit('click');
        },
    },
};
