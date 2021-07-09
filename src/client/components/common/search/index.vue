<template>

<div :class="[$style.searchTag, $attrs.class]" v-disShortcut
        ref="searchTag" @click="focusDefaultInput($event)"
        @keyup.left.stop.prevent="focusTag(-1, $event)" @keyup.right.stop.prevent="focusTag(1, $event)" 
        @keyup.delete.stop.prevent="removeTag()" @keyup.enter.stop.prevent="editTag()" :size="size">
        <div :class="$style.search">
            <u-icon name="search" size="small"></u-icon>
        </div>
        <div :class="$style.searchTagInner" :active="info.active">
            <searchTagBox 
                @cacheLineIndex="updateCacheIndex($event)"
                @add="addTag($event)"
                @remove="removeTag($event.value)" 
                @update="triggerSearch()"
                ref="searchTagBox" 
                :tagTypes="tagTypes"
                :placeholder="placeholder"
                :info.sync="info"
                 />
        </div>
        <div :class="$style.close" @click="clearAll" v-if="info.tags.length">
            <span :class="$style.closeBox"><u-icon name="close" size="small"></u-icon></span>
        </div>
</div>
    
</template>
<script>
// 详情查看 readme.md
import searchTagBox from './tag.box.vue';
import Util from './util';
export default {
    name: 'search-tag',
    props: {
        placeholder: {
            type: String,
            default: '多个搜索条件用回车分隔',
        },
        tagTypes: Object,
        limit: {
            type: Number,
            default: 0,
        },
        size: {
            type: String,
            default: '',
        },
        cached: {
            type: Object,
            default: () => ({}),
        },
    },
    components: {
        [searchTagBox.name]: searchTagBox,
    },
    data() {
        return {
            info: {
                focusIndex: -1,
                defaultInputShow: false,
                focusInput: false,
                defaultTypeIndex: 0,
                selected: {

                },
                cacheLineIndex: undefined,
                active: false,
                tags: this.selectedTags || [],
            },
        };
    },
    watch: {
        'cached.data': {
            immediate: true,
            handler(selectedTags) {
                if (selectedTags && selectedTags.length) {
                    this.cached.data = [];
                    this.resetTags(selectedTags);
                }
            },
        },
        'info.tags'(tags) {
            this.addCache(tags);
            this.triggerSearch();
        },
    },
    beforeDestroy() {
        this.cached.data = this.cached.newData;
        this.cached.newData = undefined;
    },
    methods: {
        addCache(tags) {
            this.cached.newData = tags.map((item) => {
                return {
                    type: item.type,
                    values: item.values,
                    vvalue: item.vvalue,
                };
            });
        },
        resetTags(selectedTags) {
            const tags = this.tagTypes;
            const result = [];
            selectedTags.forEach((filterItem) => {
                tags.some((item) => {
                    if (filterItem.type === item.type) {
                        const tmp = Object.assign({}, item, filterItem);
                        result.push(tmp);
                        return true;
                    }
                });
            });
            this.info.cacheLineIndex = this.cached.cacheLineIndex;
            this.info.tags = result;
            this.addCache(result);
            this.triggerSearch();
        },
        focusTag(dir, $event) {
            const { isEdit, selectingIndex } = this.getTagStatus();
            if (!isEdit && selectingIndex > -1) {
                let nextSelectingIndex = selectingIndex + dir;
                if (!(nextSelectingIndex < 0 || nextSelectingIndex > this.info.tags.length -1)) {
                    this.info.focusIndex = nextSelectingIndex;
                    this.info.defaultInputShow = false;
                    this.info.focusInput = false;
                }
                if (nextSelectingIndex > this.info.tags.length -1) {
                    this.info.focusIndex = -1;
                    this.info.defaultInputShow = true;
                    this.info.focusInput = true;
                }
                Util.preventDefault($event);
            }
        },
        updateSelected: Util.updateSelected,
        autoDeleteSelected: Util.autoDeleteSelected,
        getTagStatus() {
            let isEdit = false;
            let selectingIndex = -1;
            this.info.tags.some((tag, index) => {
                if (tag.edit) {
                    isEdit = true;
                }
                if (tag.selecting) {
                    selectingIndex = index;
                }
            });
            return {
                isEdit,
                selectingIndex,
            };
        },
        focusDefaultInput($event) {
            if ($event.target === this.$refs.searchTag) {
                this.info.defaultInputShow = true;
            }
        },
        editTag() {
            const { isEdit, selectingIndex } = this.getTagStatus();
            if (!isEdit && selectingIndex !== -1) {
                this.info.tags[selectingIndex].edit = true;
            }
        },
        updateCacheIndex() {
            this.cached.cacheLineIndex = this.info.cacheLineIndex;
            this.$emit('cacheLineIndex', this.info.cacheLineIndex);
        },
        triggerSearch(isFocus) {
            this.info.tags.forEach((tag) => {
                const vvalue = tag.vvalue = tag.vvalue || [];
                tag.vvalue.length = 0;
                tag.datas.forEach((data, index) => {
                    const cur = tag.values[index];
                    vvalue[index] = data.type === 'input' ? cur : data.values.filter((item) => item.type === cur)[0].value;
                });
            });
            this.$emit('search', {
                tags: this.info.tags,
                isFocus,
            });
        },
        addTag(tag) {
            const canAdd = this.limit ? (this.info.tags.length < this.limit) : true;
            if (canAdd) {
                this.info.tags.push(tag);
            } else {
                this.autoDeleteSelected(tag);
            }
        },
        removeTag(removeIndex) {
            const tags = this.info.tags;
            const fixSelecting = (index) => {
                this.autoDeleteSelected(tags[index]);
                tags.splice(index, 1);
                if (!tags[index] && tags[tags.length - 1]) {
                    this.info.focusIndex = tags.length - 1;
                } else if (tags[index]) {
                    this.info.focusIndex = index;
                } else {
                    this.info.focusIndex = -1;
                }
            };
            if (removeIndex === undefined) {
                const { isEdit, selectingIndex } = this.getTagStatus();
                if (!isEdit) {
                    fixSelecting(selectingIndex);
                }
            } else {
                fixSelecting(removeIndex);
            }
        },
        clearAll() {
            const selected = this.info.selected;
            this.info.tags = [];
            Object.keys(selected).forEach((item) => {
                delete selected[item];
            });
        },
    },
};
</script>  

<style module>
.searchTag {
    position: relative;
    z-index: 1;
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
    text-align: left;
    height: 34px;
    width: 300px;
    font-size: 0;
}
.searchTag[size="huge"] {
    width: 500px;
}
.searchTagInner {
    position: absolute;
    border: 1px solid #cdcdcd;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 32px;
    min-height: 32px;
    background: #fff;
}
.searchTagInner[active] {
    border: 1px solid #67aaf5;
}
.search,
.close {
    position: absolute;
    z-index: 1;
    width: 32px;
    line-height: 32px;
    top: 1px;
    bottom: 1px;
    height: 32px;
    text-align: center;
    color: #b4b4b4;
    cursor: pointer;
}
.search {
    left: 1px;
    font-size: 16px;
    cursor: default;
}
.close {
    right: 1px;
    padding: 0;
    border: 0;
    font-size: 16px;
}
.close .closeBox [size="small"]:before {
    font-size: 12px;
    margin-right: 0;
    vertical-align: middle;
}
.closeBox {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    border-radius: 18px;
    width: 18px;
    height: 18px;
    line-height: 18px;
    background: #f5f7fa;
    color: #b4b4b4;
}
.closeBox:hover {
    color: #999;
    background: #ebedef;
}
.closeBox:active {
    color: #999;
    background: #ebedef;
}

</style>