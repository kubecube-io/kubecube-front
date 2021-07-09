<template>
    <div :class="$style.desc" >
        {{ tip }}<slot></slot>
    </div>
</template>
<style module>
    .desc {
        color: #999;
        margin-top: 10px;
        margin-bottom: 10px;
    }
</style>
<script>
export default {
    name: 'u-desc',
    props: {
        tip: {
            type: String,
        },
    },
}
</script>
