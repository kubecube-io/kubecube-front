<template>
    <div :class="$style.root">
        <div :class="show? [$style.left, $style.left_show] : [$style.left, $style.left_hide]">
            <slot v-if="show" name="left-content"></slot>
            <u-tooltip :content="show ? '收起列表' : '展开列表'" placement="right">
                <i @click="show=!show" :class="show ? [$style.icon, $style.icon_left] : [$style.icon, $style.icon_right]"></i>
            </u-tooltip>
        </div>
        <div :class="show ? [$style.right, $style.right_small] : [$style.right, $style.right_large]">
            <slot name="right-content"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'middle-nav',
    data() {
        return {
            show: true,
        };
    },
};
</script>

<style module>
.root{
    position: relative;
    width: 100%;
    height: calc(100vh - 166px);
    background: #fff;
    border: 1px solid #e1e8ed;
}
.left{
    display: inline-block;
    border-right: 1px solid #e1e8ed;
    height: calc(100vh - 168px);
    max-height: calc(100vh - 168px);
    overflow-y: scroll;
    overflow-x: hidden;
}
.left_show{
    width: 250px;
    padding: 20px;
}
.left_hide{
    width: 15px;
    padding: 0px 10px;
    height: 100%;
}
.left:hover .icon_right, .left:hover .icon_left {
    display: inline-block;
}
.icon {
    display: inline-block;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    font-size: 20px;
    position: absolute;
    top: 50%;
    cursor: pointer;
    background-color: #508ae2;
    color: white;
}
.icon_right {
    left: 9px;
    margin-left: -3px;
}
.icon_left {
    left: 235px;
}
.icon_right::after {
    icon-font: url('i-line-awesome.vue/assets/angle-right.svg');
    padding-left: 3px;
}
.icon_left:after {
    icon-font: url('i-line-awesome.vue/assets/angle-left.svg');
    padding-left: 3px;
}
.right {
    position: absolute;
    top: 0;
    padding: 20px 20px 0 20px;
    width: 100%;
    height: calc(100vh - 20px);
    max-height: calc(100vh - 168px);
    overflow-y: scroll;
}
.right_small {
    left: 260px;
    max-width: calc(100% - 260px);
}
.right_large {
    left: 30px;
    max-width: 100%;
}
</style>
