<template>
    <div :class="$style.root" :size="size">
        <div :class="$style.logo" :size="size">
            <template v-if="name && name.length > 2">{{ name.substring(0,2).toUpperCase() }}</template>
            <template v-else>{{ name }}</template>
        </div>
        <div :class="$style.cont">
            <div :class="$style.title" :title="name">
                <div :class="$style.name">{{ name }}</div>
                <slot name="icon"></slot>
                <slot name="label"></slot>
            </div>
            <slot name="info"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'u-header-logo',
    props: {
        name: String,
        size: String,
    },
};
</script>

<style module>
.root{
    margin-bottom: 20px;
    display: block;
    width: 100%;
}
.root[size="small"]{
    height: 50px;
}
.root[size="large"]{
    height: 90px;
}
.logo{
    float: left;
    margin-right: 20px;
    background-color: $brand-primary;
    border-radius: 5px;
    overflow: hidden;
    text-align: center;
    font-size: 20px;
    color: #fff;
}
.logo[size="small"]{
    width: 50px;
    height: 50px;
    line-height: 50px;
}
.logo[size="large"]{
    width: 90px;
    height: 90px;
    line-height: 90px;
}
.title{
    margin-bottom: 4px;
    max-width: 100%;
}
.name{
    display: inline-block;
    vertical-align: middle;
    padding-right: 10px;
    font-size: 16px;
    color: #333;
    font-weight: bold;
    max-width: calc(100% - 200px);
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
