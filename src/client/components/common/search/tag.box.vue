<template>
    <div :class="$style.wrap" ref="textareaWrap" @mousedown="focusDefaultInput($event)">
        <template v-if="fixTags.length" v-for="(tag, key) in fixTags">
            <searchTagItem 
                v-if="!tag.edit" 
                :key="key" 
                :ref="'tag' + key" 
                :tag.sync="tag" 
                :info.sync="info"
                @remove="removeTag(key)" 
                @focus="updateTagStatus(key)" 
                @blur="blurTag(key)" />
            <searchTagItemEdit 
                v-else 
                :key="key"
                :current.sync="tag" 
                :tagTypes="tagTypes"
                :placeholder="placeholder"
                :info.sync="info"  
                @remove="removeTag(key)" 
                @tagdone="updateTagStatusDelay(key, $event)" />
        </template>
        <template v-if="(more && lineout)">
            <searchTagItem type="empty" :info.sync="info" />
        </template>
        <template v-if="(!more && !hasEdit())">
            <searchTagItemDefault 
                ref="searchTagItemDefault" 
                :placeholder="placeholder"
                :tagTypes="tagTypes"
                :info.sync="info"
                @inputfocus="inputFocus()" 
                @add="tagAdd($event.value)" 
                @blurTag="blur($event)" />
        </template>
    </div>
</template>
<style module>
.wrap {
    min-height: 32px;
    max-height: 136px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0px 32px;
    margin: 0 -32px;
    line-height: 1;
}
</style>

<script>
import Tag from './tag.vue';
import TagDefault from './tag.default.vue';
import TagEdit from './tag.edit.vue';
export default {
    props: {
        placeholder: String,
        tagTypes: Object,
        info: Object,
    },
    components: {
        [Tag.name]: Tag,
        [TagDefault.name]: TagDefault,
        [TagEdit.name]: TagEdit,
    },
    data() {
        return {
            lineout: false,
            fixTags: [],
        };
    },
    name: 'searchTagBox',
    watch: {
        'info.tags': {
            immediate: true,
            handler(tags) {
                this.fixTag(this.info.active);
                if (this.info.focusIndex - 0 !== -1) {
                    this.updateTagStatus(this.info.focusIndex);
                }
                this.updateActive();
            }
        },
        'info.focusIndex'(focusIndex) {
            if (focusIndex - 0 !== -1) {
                this.updateTagStatus(focusIndex);
                this.info.defaultInputShow = false;
            }
            this.fixTag(this.info.active);
        },
        'info.active'(active) {
            this.fixTag(active);
            if (!active) {
                this.$nextTick(() => {
                    this.getLineTag();
                });
            }
        },
        'info.defaultInputShow'(defaultInputShow) {
            this.updateActive();
        },
        'info.cacheLineIndex'(cacheLineIndex) {
            if (!this.info.active) {
                this.fixTag(this.info.active);
            }
        },
    },
    computed: {
        more() {
            let more = !this.info.active;
            if (!this.info.tags.length) {
                more = false;
            }
            return more;
        },
    },
    methods: {
        updateActive() {
            const { isEdit, selectingIndex, len } = this.getTagStatus();
            const defaultInputShow = this.info.defaultInputShow;
            const active = isEdit || selectingIndex > -1 || defaultInputShow;
            this.info.active = active;
        },
        removeTag(tagIndex) {
            this.$emit('remove', {
                value: tagIndex
            });
        },
        updateTagStatusDelay(focusIndex, $event) {
            if (!$event || !$event.mute) {
                this.$nextTick(() =>{
                    this.updateTagStatus && this.updateTagStatus(focusIndex);
                });
            }
            this.$emit('update');
        },
        blurTag(focusIndex) {
            if (focusIndex === this.info.focusIndex) {
                this.info.focusIndex = -1;
            }
            this.$nextTick(function () {
                if (!this.info.defaultInputShow && !this.hasActive()) {
                    this.info.active = false;
                }
            });
        },
        updateTagStatus(focusIndex) {
            this.info.tags.forEach((tag, index)  => {
               if (index !== focusIndex) {
                   this.$set(tag, 'selecting', false);
                   tag.edit = false;
               } else {
                   this.$set(tag, 'selecting', true);
               }
            });
            if (focusIndex !== -1) {
                this.more = false;
            }
        },
        tagAdd(tag) {
            this.$emit('add', tag);
            this.getLineTag();
        },
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
                len: this.info.tags.length,
            };
        },
        inputFocus() {
            const { isEdit, selectingIndex, len } = this.getTagStatus();
            if (!isEdit) {
                this.info.defaultInputShow = true;
            }
            this.updateTagStatus(-1);
        },
        focusDefaultInput($event) {
            if ($event.target === this.$refs.textareaWrap) {
                this.info.defaultInputShow = true;
                this.info.focusInput = true;
            }
        },
        blur($event) {
            this.info.defaultInputShow = false;
            if ($event && $event.selectLast) {
                this.updateTagStatus(this.info.tags.length - 1);
            }
        },
        hasEdit() {
            return !!(this.fixTags || []).filter((item) => {
                return item.edit;
            }).length;
        },
        hasActive() {
            return !!(this.fixTags || []).filter((item) => {
                return item.edit || item.selecting;
            }).length;
        },
        updateCacheLineIndex(value) {
            this.info.cacheLineIndex = value;
            this.$emit('cacheLineIndex', this.info.cacheLineIndex);
        },
        fixTag(active) {
            let fixTags;
            const tags = this.info.tags;
            if (active) {
                fixTags = tags;
            } else {
                // 缓存数据
                const cacheLineIndex = this.info.cacheLineIndex;
                if (cacheLineIndex && !this.dirty) {
                    this.dirty = true;
                    if (this.info.tags.length === cacheLineIndex) {
                        this.lineout = false;
                    } else {
                        this.lineout = true;
                    }
                }
                const index = cacheLineIndex || this.getLineTag();
                this.updateCacheLineIndex(index);
                fixTags = tags.slice(0, index);
            }
            this.fixTags = fixTags;
        },
        getLineTag() {
            const fixTags = this.fixTags;
            let lineIndex = 0;
            if (fixTags && this.$refs && this.$refs.textareaWrap) {
                const rmpx = function (str) {
                    return str.replace('px', '') - 0;
                };
                const maxStyle = window.getComputedStyle(this.$refs.textareaWrap);
                let width = rmpx(maxStyle.paddingLeft) + rmpx(maxStyle.paddingRight) + 42; // padding 留白 以及省略号的宽度
                const maxWidth = parseInt(rmpx(maxStyle.width));
                fixTags.some((item, index) => {
                    const tagEle = this.$refs['tag' + index];
                    if (tagEle && tagEle[0] && tagEle[0].$refs && tagEle[0].$refs.tag) {
                        const style = window.getComputedStyle(tagEle[0].$refs.tag);
                        const tagWidth = parseInt(rmpx(style.width) + rmpx(style.marginRight));
                        if (width + tagWidth >= maxWidth) {
                            if (!lineIndex) {
                                lineIndex = 1;
                            }
                            return true;
                        }
                        width += tagWidth;
                    }
                    lineIndex++;
                    return false;
                });
                if (this.info.tags.length === lineIndex) {
                    this.lineout = false;
                } else {
                    this.lineout = true;
                }
            } else {
                this.lineout = false;
            }
            this.updateCacheLineIndex(lineIndex);
            return lineIndex;
        },
    },
}
</script>

