<template>
    <div :class="$style.root">
        <u-link :class="$style.link" :to="to"><i :class="$style.back" ></i></u-link>
        <span :class="$style.head">{{title}}</span>
    </div>
</template>
<script>
    export default {
        name: 'u-back',
        props: {
            title: { type: String, default: '详情' },
            to: { type: [String, Object], default: '' },
        },
    };
</script>
<style module>
    $width:40px;
    $height:40px;
    .root{
        margin-bottom: 10px;
        height: 40px;
        line-height: $height;
    }
    .link{
        display: inline-block;
        width: $width;
        height: $height;
        color: #cfd7e6;
    }
    .link:hover{
        color: #818992;
        text-decoration: none;
    }
    .back{
        display: inline-block;
        width: 40px;
        height: 34px;
        background: url(@micro-app/common/assets/u-back.svg) no-repeat;
        vertical-align: middle;
    }
    .back:before{
        font-size: 30px;
    }
    .back:hover{
        color: #818992;
    }
    .head{
        display: inline-block;
        height: $height;
        padding-left: 10px;
        vertical-align: top;
    }
</style>
