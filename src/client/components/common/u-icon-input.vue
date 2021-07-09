<template>
    <u-input ref="input" :type="type" :value="value" :class="$style.input" @focus="onFocus" @blur="onBlur" v-bind="$attrs" v-on="$listeners">
        <i :class="$style.icon" :name="icon" :focus="isFocus"></i>
    </u-input>
</template>

<style module>
.input{
    padding-left: 40px !important;
    text-align: left;
}
.icon{
    position: absolute;
    display: inline-block;
    width: 29px;
    left: 1px;
    padding-left: 10px;
    background: #ffffff;
    height: 18px;
    line-height: 18px;
    top: 50%;
    transform: translateY(-9px);
}
.icon::before {
    cursor: auto;
    font-size: 18px;
    color: #d1d6de;
}
.icon[name='search']::before {
    icon-font: url('@micro-app/common/icons/svg/log-search.svg');
}
</style>

<script>
export default {
    name: 'u-icon-input',
    props: {
        icon: {
            type: String,
            default: 'search',
        },
        value: {
            type: String,
            default: '',
        },
        type: String,
    },
    data() {
        return {
            isFocus: false,
        };
    },
    methods: {
        onFocus($event) {
            this.isFocus = true;
        },
        onBlur($event) {
            this.isFocus = false;
        },
        focus() {
            this.$refs.input.focus();
        },
        blur() {
            this.$refs.input.blur();
        },
    },
};
</script>
