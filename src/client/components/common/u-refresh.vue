<template>
    <span :class="$style.root" @click="onClick" :status="status" :disabled="disabled">
        <u-icon name="refresh" :class="$style.icon"></u-icon>
    </span>
</template>

<style module>
@keyframes rotate {
    0% { transform: rotate(0); }
    80% { transform: rotate(360deg); }
    100% { transform: rotate(360deg); }
}
.root{
    width:24px;
    height: 24px;
    position: relative;
    display: inline-block;
    vertical-align: middle;
}
.icon[name="refresh"]::before{
    font-size: inherit;
    vertical-align: middle;
    margin: 0 5px;
}
.icon[name="refresh"]{
    position: absolute;
    top: -1px;
    cursor: pointer;
    color:#b8c3ce;
}
.icon[name="refresh"]:hover{
    color:$brand-primary;
}
.root[status="loading"] .icon[name="refresh"]{
    animation: rotate 1s ease-in-out 0s infinite;
    cursor: default;
}
.root[disabled="disabled"] .icon[name="refresh"]{
    cursor: default;
    color: #999;
}
.root[disabled="disabled"] .icon[name="refresh"]:hover{
    color: #999;
}
</style>

<script>
export default {
    name: 'u-refresh',
    props: {
        loading: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
    },
    data() {
        return {
            status: 'normal',
        };
    },
    watch: {
        loading(value) {
            if (this.status === 'loading' && !value) {
                this.timeoutId = setTimeout(() => {
                    this.status = 'normal';
                }, 900);
            } else
                this.status = value ? 'loading' : 'normal';
        },
    },
    destroyed() {
        clearTimeout(this.timeoutId);
    },
    methods: {
        onClick(e) {
            if (this.loading || this.disabled)
                return e.preventDefault();

            this.$emit('click', e);
        },
    },
};
</script>
