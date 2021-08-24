export default {
    render(h) {
        return h('router-view', {
            props: {
                ...this.$attrs,
            },
        }, this.$slots.default);
    },
};
