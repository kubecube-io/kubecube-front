<template>
    <div :class="$style.bread">
        <u-link v-if="link" :to="link">
            <i :class="$style.back"></i>
        </u-link>
        <slot>
            <span>{{name}}</span>
        </slot>
    </div>
</template>

<script>
export default {
    name: 'u-bread',
    props: {
        link: String,
        name: String,
    },
};
</script>

<style module>
.bread{
    position: relative;
    padding-left: 40px;
    line-height: 60px;
    font-size: 14px;
    color: #666;
    background: #fff;
}
.back{
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    width: 32px;
    line-height: 20px;
    height:22px;
    text-align: center;
    color: #a7b7d1;
    margin-right: 1.3em;
    margin-bottom: 2px;
    border: 1px solid #a7b7d1;
}
.back::before {
    icon-font: url('@micro-app/common/icons/svg/angle-left.svg');
}
</style>
