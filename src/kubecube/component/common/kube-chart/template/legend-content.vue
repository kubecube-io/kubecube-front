<template>
  <div :class="$style.root">
    <div
      v-for="({ legend, color }) in legends"
      :key="legend.name"
      :class="$style.legend"
      :active="!legend.disabled"
      @click="onClickLegend(legend)"
    >
      <span
        :class="$style.legendsymbol"
        :style="`background: ${color[legend.disabled ? 'disable' : 'enable']}`"
      />
      <span>{{ legend.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
    props: {
        legends: Array,
        bootChart: Function,
    },
    data() {
        return {
            focused: null,
        };
    },
    methods: {
        onClickLegend(legend) {
            if (this.focused && this.focused.name === legend.name) {
                this.legends.forEach(l => {
                    l.legend.disabled = false;
                });
            } else {
                this.focused = legend;
                this.legends.forEach(l => {
                    l.legend.disabled = (legend.name !== l.legend.name);
                });
            }
        },
    },
};
</script>

<style module>
.root{
    z-index: 1;
    max-height: 35%;
    overflow-y: scroll;
    line-height: 1em;
}
.legend{
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    font-size: .8em;
    line-height: 1em;
    display: inline-block;
    padding: 0 .5em;
}
.legendsymbol{
    display:inline-block;
    width:.5em;
    height:.5em;
    border-radius:100%;
    margin-right: .1em;
    vertical-align: middle;
}
</style>
