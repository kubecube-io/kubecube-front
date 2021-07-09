<template>
    <th :class="$style.root" :title="column.title">{{ column.title }}</th>
</template>

<script>
export default {
    props: {
        column: Object,
    },
};
</script>

<style module>
.root {
    height: 42px;
    padding: 0 0 0 10px;
    color: #999;
}
</style>
