<template>
    <u-linear-layout :class="$style.root" :alignRight="alignRight">
        <u-input :size="size" :disabled="disabled" v-model="currentValue" :placeholder="placeholder" :class="$style.input" @keyup.enter="search" @reset="search($event, '')" close>
            <u-icons :class="$style.search" name="search"></u-icons>
        </u-input>
        <u-button color="primary" @click="search" :disabled="disabled">搜索</u-button>
    </u-linear-layout>
</template>

<script>
export default {
    name: 'u-input-search',
    props: {
        name: { type: String, default: '名称' }, // 搜索主体的名称
        width: { type: String, default: 'large' }, // input输入框的长度
        disabled: { type: Boolean, default: false },
        alignRight: false,
        value: String,
    },
    data() {
        return {
            currentValue: this.value,
        };
    },
    computed: {
        size() {
            return 'large ' + this.width;
        },
        placeholder() {
            return `请输入${this.name}搜索`;
        },
    },
    watch: {
        value(value) {
            this.currentValue = value;
        },
        currentValue(value) {
            this.$emit('update:value', value);
        },
    },
    methods: {
        // reset事件抛出后，只能改变input组件内部的值，需要调用$nextTick才能够同步到父组件内的值
        // reset() {
        // },
        search(event, str) {
            str = str !== undefined ? str : this.currentValue !== undefined ? this.currentValue : '';
            this.$emit('search', str.replace(/^\s+|\s+$/g, ''));
        },
    },
};
</script>

<style module>
.root { display: inline-block; text-align: left; }
.root[alignRight] { float: right; }

.search[class]{
    position: absolute;
    left: 5px;
    color: #ccc;
}
.input[class]{
    padding-left: 30px !important;
}
</style>
