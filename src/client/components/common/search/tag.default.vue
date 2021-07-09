<template>
<div :class="$style.wrap1">
    <div :class="$style.wrap" ref="wrap">
        <textarea type="text" v-if="showInput" :edit="!!current.value"
            :class="[$style.defaultInput]" 
            :placeholder="info.tags.length ? '' : placeholder"
            v-textareaAuto rows="1" 
            ref="defalutValue" 
            @input="checkInput($event)"
            @focus="updateStatus(true)"
            @keyup.delete.stop.prevent="clearInput($event)"
            @mousedown="foucsInput"
            @keyup.up.stop.prevent="selectingTagType('up', $event)"
            @keyup.down.stop.prevent="selectingTagType('down', $event)"
            @keyup.left.stop.prevent="focusTag($event)"
            @keyup.right.stop.prevent="stopPropagation($event)"
            @keyup.enter.stop.prevent="addTag(false, $event)"
            v-model="current.value"
            v-autoScroll="true" 
            @blur.stop.prevent="addTag(true, $event)"></textarea>
        <span :mutil="!!info.tags.length" :class="[$style.textareaShadow]" ref="shadow" v-if="showInput">
            {{(current.value || '') + 'zw'}}
            <!-- zw用于占位 -->
        </span>
    </div>
    <searchTagType v-if="stepData && stepData.type === 'select'"  
    :tagTypes="stepData.values" @select="stepDataSelectFunc($event)" 
    :selected="(info.selected[current.type] || [])[current.values.length]"></searchTagType>
    
    <searchTagType v-if="showType"
        type="default" ref="searchTagType" 
        :tagTypes="tagTypes" 
        @select="selectTagTypeFunc($event)" 
        :selected="getAllSelected()"></searchTagType>
</div>
</template>

<script>
import tagEditBase from './tag.edit.base.vue';
import util from './util';
import _ from 'lodash';
export default {
    name: 'searchTagItemDefault',
    props: {
        tagTypes: Object,
        info: Object,
        placeholder: String,
    },
    extends: tagEditBase,

    data() {
        return {
            current: this.defaultCurrent(),
            typeIndex: undefined,
            stepData: null,
            stepDataSelect: false,
        };
    },
    watch: {
        'current.edit'(status) {
            this.toggleInput(status);
        },
        'info.active'(active) {
            if (!active) {
                this.clearSelectingTagType();
            }
        },
        'info.focusInput': {
            immediate: true,
            handler(showInput) {
                this.toggleInput(showInput);
            },
        },
    },
    computed: {
        showInput() {
            const current = this.current;
            const tags = this.info.tags;
            const showInput = current.edit || (!current.edit && !tags.length);
            return showInput || this.info.active;
        },
        showType() {
            const current = this.current;
            return current.edit && !current.type && !current.value;
        },
    },
    methods: {
        noop() {
            return '';
        },
        resetCurrentTag(isEdit) {
            this.current = this.defaultCurrent();
            this.updateStatus(isEdit);
            this.stepData = undefined;
        },
        defaultCurrent() {
            this.clearSelectingTagType();
            return {
                values: [],
                show: this.noop,
                value: undefined,
                isEmpty: true,
                edit: false,
                selecting: false,
                type: '',
            };
        },
        getAllSelected() {
            return Array.from(new Set((this.info.tags || []).map((item) => {
                return item.type;
            })));
        },
        addTag(isBlur, $event) {
            let currentOrigin = this.current;
            const current = Object.assign({}, currentOrigin);
            current.values = [].concat(currentOrigin.values);
            const typeIndex = this.typeIndex;
            // 如果输入完整
            if (this.isComplete(current)) {
                this.tagAdd(current);
                this.clearSelectingTagType();
                if (isBlur && !this.selectTagType) {
                    this.resetCurrentTag(false);
                    this.$emit('blurTag');
                } else {
                    this.info.active = true;
                    this.info.defaultInputShow = true;
                    this.selectTagType = false;
                    this.resetCurrentTag(true);
                    this.$emit('scrolldown');
                }
                return;
            // 用键盘上下选中了类型，并且是按的enter键
            } else if (_.isNumber(typeIndex) && !isBlur) {
                this.typeIndex = undefined;
                if (!this.stepSelected) {
                    // 类型选择器
                    this.selectTagTypeFunc({
                        value: this.tagTypes[typeIndex].type,
                    });
                } else {
                    // 值类型选择器
                    this.stepDataSelectFunc({
                        value: this.stepSelected,
                    });
                    this.stepSelected = undefined;
                    this.addTag(false);
                }
                return;
            // 其他失焦情况
            } else if (isBlur) {
                util.autoDeleteSelected.call(this);
                this.updateStatus(false);
                this.resetCurrentTag(false);
                this.clearSelectingTagType();
                this.$emit('blurTag');
            } else if (!isBlur) {
                this.current.value = (this.current.value || '').trim().replace(/[\r\n]/, '');
            }
            if (isBlur) {
                this.info.focusInput = false;
            }
        },
        tagAdd(tag) {
            Object.assign(tag, {
                edit: false,
                selecting: false,
            });
            this.$emit('add', {
                value: tag,
            });
        },
        clearInput($event) {
            $event.stopPropagation();
            const current = this.current;
            const tags = this.info.tags;
            const show = current.show();
            const inputShow = current.value || '';
            const stepData = this.stepData;
            const currentStepIsInput = function () {
                return !stepData || stepData.type === 'input';
            };
            // 子集
            const isSub = function () {
                return show.indexOf(inputShow) !== -1;
            };
            // 真子集
            const isTrueSub = function () {
                return isSub() && show !== inputShow;
            };
            const resetCurrent = () => {
                this.autoDeleteSelected();
                this.current = this.defaultCurrent();
                this.getCheck();
            };
            const resetValue = () => {
                const lastIndex = current.values.length - 1;
                if (lastIndex >= 0) {
                    this.updateSelected(current.type, current.values[lastIndex], lastIndex, true);
                    current.values.length = lastIndex;
                }
                current.value = current.show();
                this.getCheck();
            };
            // debugger;
            // 当前没有输入值
            if (!inputShow) {
                if (stepData) {
                    resetCurrent();
                } else if (!current.isEmpty) {
                    current.isEmpty = true;
                } else {
                    if (current.values.length) {
                        resetValue();
                    } else {
                        this.selectTagType = false;
                        this.$emit('blurTag', {
                            selectLast: true
                        });
                    }
                }
            } else {
                if (current.values.length) {
                    if (isTrueSub()) {
                        resetValue();
                    }
                } else {
                    if (isTrueSub()) {
                        resetCurrent();
                        this.updateStatus(true);
                    }
                }
            }
        },
        
        // 用键盘选择类型
        selectingTagType(arrow, $event) {
            const current = this.current;
            let currentData;
            if (current.datas && !this.showType) {
                currentData = current.datas[current.values.length];
            }
            if (currentData && currentData.type === 'select' || this.showType) {
                if (this.showType) {
                    this.stepSelectingTagType($event, arrow, true);
                } else {
                    this.stepSelectingTagType($event, arrow);
                }
            }
            
        },
        // 选中类型
        selectTagTypeFunc($event) {
            // 只有按键盘 上下 才有值，当有值被选中时，这个值置为空
            this.typeIndex = undefined;
            const type = $event.value;
            if (!type) {
                this.stop($event.event);
                return;
            }
            this.selectTagType = true;
            const selectTagType = this.tagTypes.filter((item) => item.type === type)[0];
            this.current = Object.assign(this.defaultCurrent(), selectTagType);
            this.current.isEmpty = true;
            this.current.value = this.current.show();
            this.updateStatus(true);
            this.getCheck();
            $event.event && $event.event.preventDefault();
        },
        foucsInput() {
            this.$emit('inputfocus');
        },
    },
}
</script>


