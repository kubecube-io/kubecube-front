<template>
    <el-button v-on="$listeners" v-bind="$attrs">
        <slot name="default"></slot>
    </el-button>
</template>
<script>
export default {
    name: 'operateButtonOption',
    data() {
        return {}
    }
}
</script>