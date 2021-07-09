<template>
    <div :class="$style.root">
        <u-linear-layout>
            <span :class="$style.title">{{ title }}</span>
            <slot></slot>
        </u-linear-layout>
    </div>
</template>

<style module>
.root {
    display: inline-block;
}
.title {
    color: #999;
}
</style>

<script>
export default {
    name: 'u-meta-info',
    props: {
        title: { type: String, default: '' },
    },
}
</script>

