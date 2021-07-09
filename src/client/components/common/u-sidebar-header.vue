<template>
  <div :class="$style.root">
    <u-sidebar-item :class="$style.module">
      <slot name="label">
        {{ label }}
      </slot>
    </u-sidebar-item>
    <slot />
    <u-sidebar-divider :class="$style.line" />
  </div>
</template>

<script>
export default {
    name: 'USidebarHeader',
    props: {
        label: String,
    },
};
</script>

<style module>
.root {
    position: relative;
    margin-top: 10px;
}
.module{
    font-size: 16px;
}
.module[class]:hover{
    color: #4c4e58;
    cursor: unset;
}
.line[class]{
    margin: 10px 0;
}
</style>
