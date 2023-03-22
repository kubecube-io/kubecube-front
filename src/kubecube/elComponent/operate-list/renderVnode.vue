<script>
import Vue from 'vue';
export default {
    props: {
        vnode: {
            type: [Object, Function],
            default: () => {},
        },
    },
    render(h) {
        this.vnode.data.attrs = this.vnode.data.attrs ? { ...this.vnode.data.attrs, ...this.$attrs } : { ...this.$attrs };
        // this.vnode.$attrs = { ...this.vnode.$attrs, ...this.$attrs };
        return this.vnode
    },
}
</script>