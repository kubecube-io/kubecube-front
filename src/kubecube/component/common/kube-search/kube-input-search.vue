<template>
  <u-linear-layout
    :class="$style.root"
    :align-right="alignRight"
  >
    <u-input
      v-model="currentValue"
      :class="$style.input"
      size="large"
      close
      v-bind="$attrs"
      @keyup.enter="search"
      @reset="search($event, '')"
    >
      <u-icons
        :class="$style.search"
        name="search"
      />
    </u-input>
    <u-button
      color="primary"
      :disabled="disabled"
      @click="search"
    >
      搜索
    </u-button>
  </u-linear-layout>
</template>

<script>
export default {
    name: 'KubeInputSearch',
    props: {
        alignRight: Boolean,
        disabled: Boolean,
    },
    data() {
        return {
            currentValue: this.value,
        };
    },
    methods: {
        search(event, str) {
            str = str !== undefined ? str : this.currentValue !== undefined ? this.currentValue : '';
            this.$emit('search', str.replace(/^\s+|\s+$/g, ''));
        },
    },

};
</script>

<style module>
.root { display: inline-block; text-align: left; }
.root[align-right] { float: right; }

.search[class]{
    position: absolute;
    left: 5px;
    color: #ccc;
}
.input[class]{
    padding-left: 30px !important;
}
</style>
