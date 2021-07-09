<template>
    <span :class="$style.tag" ref="tag" :empty="type==='empty'" 
        tabindex="-1" hidefocus="true" @blur="resetStatus" @click="showDefaultInput"
        @mousedown="updateStatus" :selected="!!tag.selecting" :edit="!!tag.edit"
        :style="[$style.tag]">
        <template v-if="type==='empty'">
            <span :class="$style.tagInner" >
                <i :class="$style.circle"></i><i :class="$style.circle"></i><i :class="$style.circle"> </i>
            </span>
        </template>
        <template v-else>
            <span :class="$style.tagInner" :title="tag.showValueLock">
                {{tag.showValueLock}}
            </span>
            <span :class="$style.tagClose" @mousedown.stop.prevent="removeTag($event)">
                <u-icon name="close" size="small"></u-icon>
            </span>
        </template>
    </span>
</template>
<style module>
.tag {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    min-width: 1px;
    background: #f5f7fa;
    line-height: 1;
    outline: 0;
    padding: 0 10px;
    border-radius: 10px;
    margin: 5px 10px 5px 0;
    max-width: 160px;
    color: #a39ba3;
    border: 1px solid #f5f7fa;
    &:hover{
        background: #e6ecf4;
        border: 1px solid #e6ecf4;
    }
}
.tag[selected],
.tag[selected]:hover{
    border: 1px solid #67aaf5;
}
.tagClose {
    position: absolute;
    right: 0;
    top: 50%;
    margin-top: -6px;
    cursor: pointer;
    color: #c9cfd8;
    margin-right: 4px;
}
.tagClose [size="small"][class]:before {
    font-size: 10px;
    display: inline-block;
    line-height: 1;
    vertical-align: 0;
    margin-right: 0;
}
.tagInner {
    display: inline-block;
    width:100%;
    overflow:hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 20px;
    word-break: break-all;
    padding-right: 14px;
    color:#666;
    font-size: 14px;
}
.tag[empty] {
    cursor:pointer;
    padding: 0 10px;
    margin-right: 0;
    .tagInner {
        padding-right: 0;
        font-size: 12px;
    }
    
}
.tagInner:after {
    content: ' ';
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 100%;
}
.circle {
    display: inline-block;
    vertical-align: middle;
    width:4px;
    height:4px;
    margin-left:4px;
    border-radius: 4px;
    background: #c9cfd8;
    font-style: normal;
    &:first-child {
        margin-left:0;
    }
    &:hover {
        .circle {
            background: #9da5b4;
        }
    }
    &:active {
        background: #e6ecf4;
        border: 1px solid #e6ecf4;
        .circle {
            background: #9da5b4;
        }
    }
}

</style>
<script>
export default {
    name: 'searchTagItem',
    props: {
        tag: {
            type: Object,
            default: () => ({}),
        },
        type: String,
        info: Object,
    },
    watch: {
        type: {
            immediate: true,
            handler(type) {
                if (type !== 'empty') {
                    const tag = this.tag;
                    tag.showValueLock = tag.show();
                    tag.showValue = tag.show();
                }
            },
        },
        'tag.selecting'(selecting) {
            selecting && this.$refs.tag && this.$refs.tag.focus();
        },
    },
    methods: {
        resetStatus() {
            this.$set(this.tag, 'selecting', false);
            this.$emit('blur');
        },
        updateStatus() {
            const selecting = this.tag.selecting;
            if (!selecting) {
                this.$set(this.tag, 'selecting', true);
            } else if (selecting) {
                this.$set(this.tag, 'edit', true);
            }
            this.$emit('focus');
        },
        removeTag() {
            this.$emit('remove');
        },
        showDefaultInput() {
            if (this.type === 'empty') {
                this.info.defaultInputShow = true;
                this.info.focusInput = true;
            }
        },
    },
}
</script>

