export default {
    name: 'u-addon',
    props: {
        name: {
            type: String,
            default: 'info',
        },
        size: {
            type: [Number, String],
            default: 14,
        },
    },
};
