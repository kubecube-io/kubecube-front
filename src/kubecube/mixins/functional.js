export const makeVModelMixin = {
    props: {
        value: {
            type: [ String, Number, Boolean, Array, Object ],
            require: true,
        },
    },
    model: {
        event: 'change',
        prop: 'value',
    },
    computed: {
        model: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('change', val);
            },
        },
    },
};
