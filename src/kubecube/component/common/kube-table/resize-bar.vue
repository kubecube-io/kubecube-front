/* eslint-disable vue/html-self-closing */
<template>
  <div
    :class="$style.root"
    @mousedown="onMouseEvent('mousedown', $event)"
    @click.prevent.stop
  />
</template>

<script>
export default {
    props: {
        column: Object,
    },
    methods: {
        onMouseEvent(type, $event) {
            this.$emit(type, {
                movementX: $event.movementX, // IE OPERA Safari not support
                column: this.column,
            });
        },
    },
};
</script>

<style module>
.root {
    width: 20px;
    height: 100%;
    text-align: center;
    z-index: 20;
    position: absolute;
    top: 2px;
    right: 0;
    cursor: col-resize;
    padding: 10px;
}
.root::after{
    content: " ";
    display: block;
    width: 100%;
    height: 100%;
    border-right: 1px solid #ddd;
}
</style>
