<template>
    <div :class="$style.root" :color="color">
        <u-status-icon :name="icon" size="18">
            <slot></slot>
        </u-status-icon>
    </div>
</template>

<style module>
.root{
    padding: 0 14px;
    border: 1px solid #f6e0c4;
    margin-bottom: 20px;
}
.root[color="warning"]{
    background: #fbf7cf;
    color: #dfb050;
    border-color: #f6e0c4;
}
.root[color="warning"] span{color: #dfb050;}

.root[color="info"]{
    background: #eff6fa;
    color: #367da6;
    border-color: #cce1ef;
}
.root[color="info"] span{color: #367da6;}

.root > [name="warning"]:before{
    vertical-align: -4px;
    font-size: 18px;
    margin-right: 3px;
}
</style>
<script>
export default {
    name: 'u-notice',
    props: {
        icon: String,
        color: { type: String, default: 'warning' },
    },
};
</script>
