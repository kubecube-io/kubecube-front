<template>
    <u-tooltip :placement="placement" :size="size">
        <i :class="$style.help"></i>
        <div slot="content">
            <slot></slot>
        </div>
    </u-tooltip>
</template>
<style module>
.help {
    position: relative;
    top: 2px;
    padding-left: 5px;
}
.help:after {
    color: #bac2cf;
    icon-font: url(@micro-app/common/icons/svg/help.svg);
}
</style>
<script>
// 通过hover上去展示tooltip给出解释的简单组件。

export default {
    name: "u-note",
    props: {
        // tooltip展示的方位
        placement: { type: String, default: 'right' },
        size: { type: String, default: 'normal' },
    },
    data() {
        return {

        };
    },
}
</script>
