export default {
    functional: true,
    props: {
        slotgen: Function,
        item: Object,
    },
    render(c, context) {
        const vnode = context.props.slotgen({
            item: context.props.item,
        });
        return vnode;
    },
};
