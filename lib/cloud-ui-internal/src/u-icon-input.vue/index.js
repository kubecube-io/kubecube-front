export default {
    name: 'u-icon-input',
    props: {
        icon: {
            type: String,
            default: 'search',
        },
        value: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            isFocus: false,
        };
    },
    methods: {
        onFocus($event) {
            this.isFocus = true;
        },
        onBlur($event) {
            this.isFocus = false;
        },
        focus() {
            this.$refs.input.focus();
        },
        blur() {
            this.$refs.input.blur();
        },
    },
};
