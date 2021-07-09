<template>
  <tr
    :class="$style.root"
    topAlign
  >
    <slot />
    <td
      v-if="!hideClose"
      :class="$style.formTd"
    />
  </tr>
</template>

<script>
export default {
    props: {
        hideClose: Boolean,
    },
};
</script>

<style module>
@import './table.css';
</style>
