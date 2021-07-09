<template>
  <span
    :class="$style.root"
    :title="data[column.name]"
  >{{ data[column.name] }}</span>
</template>

<script>
export default {
    props: {
        data: Object,
        column: Object,
    },
};
</script>

<style module>
.root {
    white-space: break-spaces;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
