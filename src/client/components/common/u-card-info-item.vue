<template>
    <div :class="$style.root" :style="{ width }">
        <slot>
            <div :class="$style.cardwrap">
                <div :class="$style.text">{{ text }}</div>
                <u-link :type="type" :to="to">
                    <span :class="$style.value">{{ value }}</span> {{ unit }}
                </u-link>
            </div>
        </slot>
    </div>
</template>

<style module>
.root {
    display: inline-block;
    /* padding: 10px 20px; */
    padding: 20px;
    text-align: center;
    vertical-align: top;
}
.text {

}
.value{
    font-size: 22px;
}
.unit {
    color: #333;
}
.cardwrap{
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    margin-right: 3.5%;
    margin-left: 0;
    text-align: center;
}
.cardwrap:last-child{
    margin-right: 0px;
}
.cardwrap a{
    height: 60px;
    line-height: 60px;
    border: 1px solid #e1e8ed;
    margin-top: 10px;
    font-size: 12px;
    color: #999;
    text-align: center;
    display: block;
    background-color: #f5f9fb;
    border-top-width: 1px;
    border-top-style: solid;
    text-decoration: none;
    cursor: default;
}
.cardwrap a:hover{
    text-decoration: none;
}
.cardwrap a[type="orange"]{
    border-top-color: #fcc87e;
}
.cardwrap a[type="deeporange"]{
    border-top-color: #ff993f;
}
.cardwrap a[type="greenpurple"]{
    border-top-color: #00d9b9;
}
.cardwrap a[type="blue"]{
    border-top-color: #00b2eb;
}
.cardwrap a[type="purplered"]{
    border-top-color: #ff5f66;
}
</style>

<script>
import { Emitter } from 'cloud-ui.vusion';

export default {
    name: 'u-card-info-item',
    parentName: 'u-card-info',
    mixins: [Emitter],
    props: {
        text: { type: String, default: '' },
        unit: { type: String, default: '' },
        value: { type: [String, Number], default: '' },
        type: { type: String, default: 'greenpurple' },
        to: [String, Object],
    },
    data() {
        return {
            width: '', // 当前宽度百分比
            currentValue: this.value || '-',
            currentText: this.text || '-',
            currentUnit: this.unit,
        };
    },
    watch: {
        text(value) {
            value && (this.currentText = value);
        },
        unit(value) {
            value && (this.currentUnit = value);
        },
        value(value) {
            value && (this.currentValue = value);
        },
    },
    created() {
        this.dispatch(this.$options.parentName, 'add-item-vm', this);
        this.$nextTick(() => {
            this.width = this.$parent.width;
        });
    },
    destroyed() {
        this.$parent.remove(this);
    },
};
</script>

