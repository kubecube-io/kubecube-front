<template>
  <component
    :is="component"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </component>
</template>

<script>
import Pipe from './pipe.mixin';
export default {
    extends: Pipe,
    props: {
        component: {
            type: [ String, Object ],
            default: 'div',
        },
        graph: String,
    },
    mounted() {
        this.pipeRequest();
    },
};
</script>

<style>

</style>
