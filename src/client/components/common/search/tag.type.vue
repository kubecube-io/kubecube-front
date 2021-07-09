<template>
<div :class="$style.wrap">
    <ul :class="$style.listView">
        <li :class="[$style.listViewItemFirst, $style.listViewItem]" 
            v-if="type==='default'" 
            @mousedown.stop.prevent="stop($event)">
            选择搜索标签类型
        </li>
        <li :class="[$style.listViewItemEmpty, $style.listViewItem]"
            @mousedown.stop.prevent="stop($event)" 
            v-else-if="!tagTypes">
            数据加载中
        </li>
        <li :class="[$style.listViewItemEmpty, $style.listViewItem]"
            @mousedown.stop.prevent="stop($event)" 
            v-else-if="!(tagTypes && (tagTypes.length || Object.keys(tagTypes).length))">
            暂无数据
        </li>
        <li v-for="(tagType, key) in tagTypes" :key="key" v-autoScroll="tagType.selecting"
            :class="[ $style.listViewItem]" :selected="tagType.selecting" :disabled="isSelected(tagType)&&tagType.unique"
            :title="tagType.label" @mousedown="selectTagType(tagType, $event)">
           {{tagType.label}}
        </li>
    </ul>
</div>
</template>
<style module>
.wrap {
    display: block;
    position: absolute;
    left: 33px;
    top: 100%;
    width: 180px;
    margin-top: 8px;
    font-size: 14px;
    z-index: 5;
}
.listView {
    max-height: 230px;
    line-height: 1.6;
    background: #fff;
    color: #666;
    border-radius: 0 0 2px 2px;
    border: 1px solid #cbd5dd;
    box-sizing: border-box;
    user-select: none;
    overflow-x: hidden;
    overflow-y: auto;
}
.listViewItem {
    padding: 6px 12px;
    color: inherit;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
    box-sizing: content-box;
}
.listViewItem[selected] {
    background: #67aaf5;
    color: #fff;
}
.listViewItem[disabled] {
    background: none;
    color: #ccc;
}
.listViewItemEmpty,
.listViewItemFirst {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #e1e8ed;
    color: #999;
    cursor: default;
    padding-top: 4px;
    padding-bottom: 4px;
}
.listViewItemEmpty {
     border-bottom: 0;
}
</style>      
<script>
export default {
    props: {
        selected: Array,
        tagTypes: Array,
        type: String,
    },
    name: 'searchTagType',
    methods: {
        isSelected(tagType) {
            return !this.selected ? false : this.selected.indexOf(tagType.type) !== -1;
        },
        stop($event) {
            if ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            }
        },
        selectTagType(tagType, $event) {
            if (tagType.unique && this.isSelected(tagType)) {
                this.stop($event);
                return;
            }
            this.$emit('select', {
                value: tagType.type,
                event: $event,
            });
        },
    },
}
</script>

