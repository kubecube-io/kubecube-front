export default {
    functional: true,
    props: {
        expand: Boolean,
    },
    render(h, { slots, props }) {
        const computedSlots = slots();
        const children = [];
        if (computedSlots.content) {
            children.push(...computedSlots.content);
        }
        if (computedSlots.expand && props.expand) {
            children.push(...computedSlots.expand);
        }
        return children;
    },
};
