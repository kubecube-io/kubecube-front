<template>
    <div :class="$style.root">
        <i :class="[$style.icon, iconName]" :style="`color:${iconColor};font-size:${size}`"></i>
    </div>
</template>
<script>
const colorMap = {
    default: '#b2b2b2',
    success: '#00b85b',
    error: '#f54545',
    warning: '#faab0c',
}
const iconMap = {
    expire: 'el-icon-time',
    waiting: 'el-icon-more-outline',
    success: 'el-icon-circle-check',
    error: 'el-icon-circle-close',
    warning: 'el-icon-warning-outline',
    loading: 'el-icon-remove-outline',
}
export default {
    props: {
        size: {
            type: String,
            default: '24px'
        },
        name: {
            type: String,
            default: ''
        }
    },
    computed: {
        iconColor() {
            return colorMap[this.name] || colorMap.default;
        },
        iconName() {
            return iconMap[this.name] || this.name;
        },
    }
}
</script>
<style module>
.root {
    display: inline-block;
    margin-right: 8px;
}
.icon {
    vertical-align: middle !important;
}
</style>