<template>
    <div :class="$style.card">
        <div :class="$style.head">
            <u-checkbox :disabled="data.length===0" v-model="allChecked">全选</u-checkbox>
        </div>
        <div :class="$style.body">
            <u-checkboxes v-if="data.length > 0" v-model="checkedList">
                <div v-for="item in data" :key="item" :class="$style.item">
                    <u-checkbox :label="item.value" :title="item.text" :disabled="!!item.disabled">
                        {{item.text}}
                    </u-checkbox>
                </div>
            </u-checkboxes>
            <p :class="$style.placeholder" v-else>
                {{placeholder}}
            </p>
        </div>
    </div>
</template>
<style module>
.card{
    max-width: 100%;
    width: 580px;
    max-height: 360px;
    overflow-y: auto;
    border: 1px solid #e1e8ed;
}
.head{
    padding: 5px 10px;
    height: 41px;
    line-height: 30px;
    border-bottom: 1px solid #e1e8ed;
    background-color: #eef2f5;
}
.body{
    max-height: 318px;
    overflow: auto;
    padding: 10px 10px;
    padding-bottom: 5px;
}
.item{
    display: inline-block;
    width: 33%;
    padding-right: 20px;
    margin-right: 0px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.placeholder{
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin: 0px;
    color: rgb(153, 153, 153);
}
</style>
<script>
import Field from 'proto-ui.vusion/src/u-field.vue';

export default {
    name: 'u-checkbox-card',
    mixins: [Field],
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        value: {
            type: Array,
            default: () => [],
        },
        placeholder: {
            type: String,
            default: '暂无可选项',
        },
        size: {
            type: String,
            default: 'normal',
        },
    },
    data() {
        return {
            checkedList: this.value,
        };
    },
    computed: {
        allChecked: {
            set(checked) {
                if (checked) {
                    this.checkedList = this.data.map((item) => item.value);
                } else {
                    this.checkedList = this.data.filter((item) => item.disabled).map((item) => item.value);
                }
            },
            get() {
                if (this.data.length === 0) {
                    return false;
                }
                if (this.checkedList.length === this.data.length)
                    return true;
                else if (this.checkedList.length === 0)
                    return false;
                else
                    return null;
            },
        },
    },
    watch: {
        value(val) {
            this.checkedList = val;
        },
        checkedList(val) {
            this.$emit('update:value', val);
            this.$emit('input', val);
        },
    },
    methods: {
        // checkAll(checked) {
        //     if(checked) {
        //         this.checkedList = this.data.map((item) => {
        //             return item.value;
        //         });
        //     } else {
        //         this.checkedList = [];
        //     }

        // },
        // onCheck(value) {
        //     if (this.checkedList.length === this.data.length)
        //         this.allChecked = true;
        //     else if (this.checkedList.length === 0)
        //         this.allChecked = false;
        //     else
        //         this.allChecked = null;
        // },
        getCheckList() {
            return [...this.checkedList];
        },
    },
};
</script>
