<template>
  <component
    :is="component"
    :class="$style.root"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <u-loading
      v-if="loading"
      :class="$style.loading"
    />
    <slot
      v-else
    />
  </component>
</template>

<script>
import valve from './valve.mixin';
export default {
    extends: valve,
    props: {
        component: {
            type: [ String, Object ],
            default: 'div',
        },
        request: Function,
        valve: [ String, Number, Object, Array ],
        name: String,
    },
    data() {
        return {
            model: this.valve,
        };
    },
    mounted() {
        this.$on('pipestatechange', this.onLoadingChange);
        this.unwatchValve = this.$watch(() => this.valve, val => {
            this.model = val;
        });
    },
    beforeDestroy() {
        this.unwatchValve();
        this.$off('pipestatechange', this.onLoadingChange);
    },
    methods: {
        onLoadingChange(val) {
            this.loading = val;
        },
    },
};
</script>
<style module>
.root{
    position: relative;
}
.loading{
    position: absolute;
    left: 0;
    top: -26px;
}
</style>
