<template>
    <div :class="$style.root">
        <div :class="$style.title">{{ title }}</div>
        <div :class="$style.content"><slot></slot></div>
    </div>
</template>

<style module>
.root{
    margin: 20px 0;
}

.title {
}
.content {
    margin: 20px 0 20px 20px;
    max-width: 700px;
}

</style>
<script>
export default {
    name: 'u-section',
    props: {
        title: String,
    },
};
</script>
