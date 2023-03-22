<template>
    <div :class="$style.root">
        <renderVnode v-for="(item, index) in getContentVnodes()" :key="index" :vnode="item" :type="index === 0 ? 'primary' : ''"/>
        <el-popover
            v-model="showPopover"
            placement="bottom"
            trigger="click"
            :popper-class="$style.moreContentWrap"
            v-if="getMoreContentVnodes().length"
        >
            <el-button slot="reference" style="margin-left: 12px">
                {{moreBtnContent}}
                <i class="el-icon-caret-bottom"/>
            </el-button>
            <div :class="$style.moreContent" @click="showPopover = false">
                <renderVnode v-for="(item, index) in getMoreContentVnodes()" :key="index" :vnode="item"/>
            </div>
        </el-popover>
    </div>
</template>
<script>
import renderVnode from './renderVnode.vue';
export default {
    components: {
        renderVnode,
    },
    props: {
        showCount: {
            type: Number,
            default: 3,
        },
        moreBtnContent: {
            type: String,
            default: '更多'
        }
    },
    data() {
        return {
            showMore: false,
            showPopover: false,
        }
    },
    methods: {
        getOptions() {
            return (this.$slots.default || []).filter(item => item.tag && item.tag.endsWith('-operateButtonOption'))
        },
        getContentVnodes() {
            const options = this.getOptions();
            return options.length > this.showCount ? options.slice(0, this.showCount - 1) : options.slice();
        },
        getMoreContentVnodes() {
            const options = this.getOptions();
            return options.length > this.showCount ? options.slice(this.showCount - 1) : [];
        }
    }
}
</script>
<style module>
.root {
    display: inline-block;
}
.moreContentWrap{
    padding: 4px 0!important;
}
.moreContent {
    display: flex;
    flex-direction: column;
}
.moreContent :global(.el-button + .el-button) {
    margin-left: 0;
}
.moreContent > :global(.el-button) {
    border-radius: 0;
    border: none;
}
</style>
