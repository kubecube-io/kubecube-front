<template>
  <div
    ref="root"
    :class="$style.root"
    :style="`transform: translate(${localx + 20}px, ${y + 20}px)`"
  >
    <p>
      {{ xDimension }}
    </p>
    <table :class="$style.table">
      <tr
        v-for="s in series"
        :key="s.name"
      >
        <td>
          <span
            :class="$style.legend"
            :style="`background: ${s.color}`"
          />
          <span>{{ s.name }}</span>
        </td>
        <td>
          <span>{{ s.data }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
    props: {
        x: Number,
        y: Number,
        xDimension: String,
        series: Array,
    },
    computed: {
        localx() {
            if (!this.$el) return this.x;
            const left = this.$el.parentElement.getBoundingClientRect().left;
            const width = this.$el.getBoundingClientRect().width;
            if (this.x + width + left > window.innerWidth) {
                return this.x - width - 20;
            }
            return this.x;
        },
    },
};
</script>

<style module>
.root{
    z-index: 1;
    background: rgba(0, 0, 0, 0.6);
    position: absolute;
    left: 0;
    top: 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    color: #fff;
    font-size: .8em;
    z-index: 999;
    user-select: none;
}
.legend{
    display:inline-block;
    width:.8em;
    height:.8em;
    border-radius:100%;
    margin-right:.5em
}
.root p {
    text-align: center;
    margin: 0;
    line-height: 1.5em;
}
.table td {
    padding: 2px 4px;
    line-height: 1em;
}
.table span,
.table td{
    white-space: nowrap;
}
</style>
