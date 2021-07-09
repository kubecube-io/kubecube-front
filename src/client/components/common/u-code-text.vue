<template>
    <div :class="$style.code">
        <div class="f-tac" v-if="loading"><u-loading></u-loading></div>
        <div :class="$style.content" v-else>
            <pre :class="$style.text">{{code}}</pre>
        </div>
    </div>
</template>
<script>
export default {
    name: 'u-code-text',
    props: {
        code: {
            type: String,
            default: ''
        },
        loading: {
            type: Boolean,
            default: false,
        }
    }
}
</script>
<style module>
.code{
    /* width: 700px; */
    padding: 10px;
    background-color: #f5f7f9;
}
.content{
    /* min-height: 215px; */
    overflow: scroll;
}
.text{
    /* margin: 0; */
    min-height: 20px;
    /* line-height: 20px; */
    color: #999;
}
</style>