<script>
export default {
    name: 'qz-link-simple',
    props: {
        link: Object,
        hasMore: Boolean,
    },
    render(v) {
        return v(
            'div',
            {
                class: [ this.$style.simple, this.hasMore ? '' : this.$style.noMore ],
                key: this.link.context._uid,
            },
            [ this.link ]
        );
    },
};
</script>
<style module>
.simple {
    display: inline-flex;
}
.simple a,
.simple button {
    margin-right: 12px;
}
.noMore:last-of-type a,
.noMore:last-of-type button {
    margin-right: 0;
}
</style>
