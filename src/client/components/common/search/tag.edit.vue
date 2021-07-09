<template>
    <div :class="$style.wrap1">
        <div :class="$style.wrap" ref="wrap" >
            <textarea type="text" 
            :class="[$style.defaultInput]" 
            edit
            v-textareaAuto rows="1" 
            ref="defalutValue"
            @focus="updateStatus(true)"
            @keyup.backspace.stop.prevent="clearInput($event)"
            @keyup.delete-origin.stop.prevent="stopPropagation($event)"
            @input="checkInput($event)"
            @keyup.up.stop.prevent="stepSelectingTagType($event, 'up')"
            @keyup.down.stop.prevent="stepSelectingTagType($event, 'down')"
            @keyup.left.stop.prevent="focusTag($event)"
            @keyup.right.stop.prevent="stopPropagation($event)"
            v-model="current.value"
            @keyup.enter.stop.prevent="updateTag(false,$event)"
            @blur.stop.prevent="updateTag(true,$event)"
            v-autoScroll="true" 
            ></textarea>
            <span :mutil="!!info.tags.length" :class="[$style.textareaShadow]" ref="shadow" >
                {{(current.value || '') + 'zw'}}
                <!-- zw用于占位 -->
            </span>
        </div>

        <searchTagType 
            v-if="stepData && stepData.type === 'select' && stepData.values" 
            :tagTypes="stepData.values" @select="stepDataSelectFunc($event)" 
            :selected="info.selected[current.type][current.values.length]"></searchTagType>
    </div>
</template>


<script>
import tagEditBase from './tag.edit.base.vue';
import _ from 'lodash';
export default {
    name: 'searchTagItemEdit',
    extends: tagEditBase,
    props: {
        placeholder: String,
        tagTypes: Object,
        info: Object,
        current: Object,
    },
    data() {
        const current = this.current;
        current.value = current.show();
        this.resetLastSelect(current);
        current.isEmpty = true;
        return {
            defaultTypeIndex: 0,
            
            typeIndex: undefined,
            stepData: null,
            stepDataSelect: false,
        };
    },
    watch: {
        'current.edit': {
            immediate: true,
            handler(status) {
                this.toggleInput(status);
            },
        },
    },
    methods: {
        resetLastSelect(current) {
            const lastIndex = current.values.length - 1;
            if (lastIndex >= 0) {
                this.updateSelected(current.type, current.values[lastIndex], lastIndex, true);
            }
            current.values.pop();
        },
        clearInput($event) {
            this.stopPropagation($event);
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
                current.values.length = 0;
                current.value = current.show();
                this.getCheck();
            };
            const resetValue = () => {
                this.resetLastSelect(current);
                current.value = current.show();
                this.getCheck();
            };
            // debugger;
            // 当前没有输入值
            if (!inputShow) {
                resetCurrent();
            } else {
                if (current.values.length) {
                    if (isTrueSub()) {
                        resetValue();
                    }
                } else {
                    if (isTrueSub()) {
                        resetCurrent();
                    }
                }
            }
        },
        checkInput($event) {
            this.stopPropagation($event);
            // 该方法先于 clearInput 触发
            this.getCheck();
            const current = this.current;
            const show = current.show(); // 当前输入框应该显示的展示值
            const inputShow = $event && $event.target ? ($event.target.value || '') : (current.value || '');
            current.value = inputShow;
            // 如果用户选择了查询类型，并且当前步骤的输入值类型不是 input
            if (this.stepData && this.stepData.type !== 'input') {
                // 当前输入框的值不是应该显示值的子集
                if (show.indexOf(inputShow) === -1) {
                    // 由于当前是不允许输入的，所以恢复默认值
                    current.value = this.$refs.defalutValue.value = show;
                }
            } else {
                this.selectTagType = false;
            }
        },
        updateStatus(status) {
            this.current.edit = status;
            this.current.selecting = status;
            this.toggleInput(status);
        },
        updateTag(isBlur, $event) {
            this.stopPropagation($event);
            let currentOrigin = this.current;
            const current = Object.assign({}, currentOrigin);
            current.values = [].concat(currentOrigin.values);
            const typeIndex = this.typeIndex;
            // 如果输入完整
            if (this.isComplete(current)) {
                Object.assign(this.current, {
                    edit: false,
                    selecting: false,
                    values: current.values,
                });
                // 这里会触发 blur，所以提供一个属性进行后续判断
                this.isCompleteTmp = true;
                if (!isBlur) {
                    this.$emit('tagdone');
                } else {
                    if (this.selectTagType) {
                        this.selectTagType = false;
                        this.$emit('tagdone');
                    } else {
                        this.$emit('tagdone', {
                            $event: {
                                mute: true
                            }
                        });
                    }
                }
                return;
                // 用键盘上下选中了类型，并且是按的enter键
            } else if (_.isNumber(typeIndex) && !isBlur) {
                this.typeIndex = undefined;
                // 值类型选择器
                this.stepDataSelectFunc({
                    value: this.stepSelected,
                });
                this.stepSelected = undefined;
                this.updateTag(false);
                return;
            // 其他失焦情况
            } else if (isBlur) {
                if (this.selectTagType) {
                    this.updateStatus(true);
                    this.selectTagType = false;
                    this.focusCampo(this.$refs.defalutValue);
                } else if (!this.isCompleteTmp) {
                    this.$emit('remove');
                } else if (this.isCompleteTmp) {
                    this.isCompleteTmp = false;
                }
            } else if (!isBlur) {
                this.current.value = (this.current.value || '').trim().replace(/[\r\n]/, '');
            }
        },
    },
}
</script>

