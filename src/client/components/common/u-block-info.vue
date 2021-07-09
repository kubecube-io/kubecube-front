<template>
    <div :class="$style.root">
        <div v-if="title" :class="$style.title">{{ title }}</div>
        <div :class="$style.content"><slot></slot></div>
    </div>
</template>

<style module>
.root {
    margin-bottom: 20px;
}
.title {
    margin-bottom: 10px;
    color: #333;
}
.content {
    box-sizing: border-box;
    padding: 24px 0;
    border: 1px solid #ebf0f5;
}
</style>
<script>
export default {
    name: 'u-block-info',
    props: {
        title: String,
        data: { type: Object, default: () => {} },
    },
    data() {
        return {
            columns: [],
        };
    },
    computed: {
        width() {
            return (100 / this.columns.length).toFixed(3) + '%';
        },
    },
    created() {
        this.$on('add-item-vm', (itemVM) => {
            itemVM.parentVM = this;
            this.columns.push(itemVM);
        });
    },
    methods: {
        remove(item) {
            const index = this.columns.indexOf(item);
            ~index && this.columns.splice(index, 1);
        },
    },
}
</script>


