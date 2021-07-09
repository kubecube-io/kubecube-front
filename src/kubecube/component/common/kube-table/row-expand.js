export default {
    props: {
        columns: Array,
    },
    data() {
        return {};
    },
    render(h) {
        return h('tr', [
            h('td', {
                style: {
                    padding: '0',
                },
                attrs: {
                    colspan: this.columns.length,
                },
            },
            this.$slots.default
            ),
        ]);
    },
};
