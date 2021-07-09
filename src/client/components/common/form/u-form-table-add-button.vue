<template>
    <u-button @click="click" :class="$style.button" :disabled="disabled" :isContainer="isContainer">
        + <slot></slot>
    </u-button>
</template>

<style module>
.button{
    font-size: 14px;
    width: 100%;
    padding: 0 30px;
    margin: 0;
    overflow: visible;
    font: inherit;
    text-transform: none;
    text-decoration: none;
    cursor: pointer;
    box-sizing: border-box;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    height: 40px;
    line-height: 40px;
    width: 100%;
    background: #fbfcfc;
    border: 1px solid #e1e8ed;
    color: #5494db;
    outline:none;
}
.button:hover {
    color: #67aaf5;
    text-decoration: none;
    border: 1px solid #e1e8ed;
    box-shadow: 0 0 8px rgba(13,4,8,0.1);
}
.button[disabled] {
    background: #fff;
    color: #ccc;
    border: 1px solid #ddd;
}
.button[disabled]:hover {
    box-shadow: 0 0 0 transparent;
    cursor: not-allowed;
}

.button[isContainer] {
    background: #fff;
    height: 56px;
    line-height: 56px;
}
</style>

<script>
export default {
    name: 'u-form-table-add-button',
    props: {
        isContainer: Boolean,
        disabled: Boolean,
    },
    methods: {
        click() {
            this.$emit('click');
        }
    }
};
</script>
