<template>
    <div :class="$style.cardWrap">
        <div :class="$style.cardHeader">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" :disabled="disabled || options.length === 0">全选</el-checkbox>
        </div>
        <div :class="$style.cardBody">
            <el-checkbox-group v-if="options.length" v-model="checkedItems" :class="$style.checkboxGroup" :disabled="disabled">
                <el-checkbox v-for="item in options" :label="item.value" :key="item.value" :class="$style.checkboxItem" :disabled="disabled || !!options.disabled" :title="item.text">{{item.text}}</el-checkbox>
            </el-checkbox-group>
            <div v-else :class="$style.emptyMesasge">{{placeholder}}</div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        options: {
            type: Array,
            default: () => [],
        },
        value: {
            type: Array,
            default: () => [],
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: '暂无可选项'
        }
    },
    data() {
        return {
            checkedItems: this.value || [],
        };
    },
    watch: {
        value(val) {
            this.checkedItems = val;
        },
        checkedItems(val) {
            this.$emit('input', val);
        },
    },
    computed: {
        isIndeterminate() {
            const optionItems = this.options.map(item => item.value);
            const validItems = this.checkedItems.filter(item => optionItems.includes(item));
            const validCheckedCount = validItems.length;
            return validCheckedCount > 0 && validCheckedCount < this.options.length;
        },
        checkAll: {
            get() {
                const optionItems = this.options.map(item => item.value);
                const validItems = this.checkedItems.filter(item => optionItems.includes(item));
                const validCheckedCount = validItems.length;
                return validCheckedCount === this.options.length;
            },
            set(newValue) {
                this.checkedItems = newValue ? this.options.map(item => item.value) : [];
            },
        },
    },
    methods: {

    },
};
</script>
<style module>
.cardWrap {
    border: 1px solid #e1e8ed;
}
.cardHeader {
    padding: 5px 10px;
    height: 41px;
    line-height: 30px;
    border-bottom: 1px solid #e1e8ed;
    background-color: #eef2f5;
}
.cardBody{
    max-height: 318px;
    overflow: auto;
    padding: 10px 10px;

}
.checkboxGroup{
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
}
.checkboxItem{
    height: 40px;
    line-height: 40px;
    width: calc(33% - 30px);
    display: flex;
    align-items: center
}
.checkboxItem > span:nth-child(2){
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.emptyMesasge{
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin: 0;
    color: #999;
    width: 100%;
}
</style>
