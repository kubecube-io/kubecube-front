<script>
export default {
    name: 'qz-link-more',
    props: {
        link: Object,
        isButton: Boolean,
    },
    render(v) {
        return v(
            'el-dropdown-item',
            {
                class: [ this.$style.more, !this.isButton ? this.$style.moreLink : '' ],
                key: this.link.context._uid,
            },
            [ this.link ]
        );
    },
};
</script>
<style module>
.more {
    padding: 0 !important;
}
.more a,
.more a:hover,
.more a:focus,
.more a:active {
    box-sizing: border-box;
    width: 100%;
    text-decoration: none;
    border: none;
    background: transparent;
    color: var(--color-text-regular);
    text-align: center;
}
.moreLink a {
    padding: 0 24px;
}
</style>
