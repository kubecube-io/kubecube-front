export default {
    name: 'u-card',
    props: {
        amount: {
            type: Number,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        unit: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
    },
    data() {
        return {};
    },
};
