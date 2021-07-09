<template>
  <span :class="$style.root">
    <u-icon
      :class="$style.icon"
      :role="role"
      v-bind="$attrs"
    />
  </span>
</template>

<script>
export default {
    props: {
        role: Boolean,
    },
};
</script>

<style module>
.root {
    position: absolute;
    display: inline-block;
    margin-left: .5em;
    text-align: center;
}
.icon {
    position: relative;
    top: -5px;
}
.icon::before {
    font-size: 14px !important;
    color: #d3d8e0;
}

.icon[role]::before {
    color: #67aaf5;
}
</style>
