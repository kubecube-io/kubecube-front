<template>
    <div :class="$style.root">
        <div :class="$style.head">
            <slot name="head"></slot>
        </div>
        <div :class="$style.content">
            <slot></slot>
        </div>
    </div>
</template>

<style module>
.root{
    min-width: 1000px;
    border: 1px solid #ebf0f5;
    box-sizing: border-box;
    color: #999;
    margin-bottom: 30px;
}
.root:hover {
        box-shadow: 0 0 10px 0 rgba(80,90,109,0.16);
}
.head{
    height: 40px;
    line-height: 40px;
    background-color: #f5f7fa;
    padding-left: 20px;
    border-bottom: 1px solid #ebf0f5;
}
.content {
    margin: 0 20px;
}
</style>

<script>
export default {
    name: 'u-card-info',
    props: {
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


