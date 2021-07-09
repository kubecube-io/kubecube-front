<template>
    <div @click="click" :class="$style.button">
    </div>
</template>

<style module>
.button{
    position: relative;
    cursor: pointer;
    margin-bottom: 0;
    font-size: 40px;
    color: #ff867f;
    height: 40px;
    line-height: 40px;
}
.button[disabled]{
    color: #ddd;
    cursor: not-allowed;
}
.button::before{
    icon-font: url('@micro-app/common/icons/svg/tb-del.svg');
}
</style>

<script>
export default {
    name: 'u-form-table-remove-button',
    methods: {
        click() {
            if (this.disabled)
                return;
            this.$emit('click');
        },
    },
};
</script>
