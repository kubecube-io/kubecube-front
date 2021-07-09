<template>
	<u-linear-layout direction="vertical">
        <!-- 这里通过一个random，可以保证内部的所有组件都是数据独立的 -->
        <div :class="$style.root" :mini="index !== current" v-for="(item, index) in sortList" :key="randoms[index]" :size="size">
            <!-- 最小化显示节点 -->
            <div v-show="index !== current" :class="$style.mini" @click="open(index)">
                <!-- 容器名称 -->
                <span :class="$style.rootName" :title="item.miniText">{{ item.miniText || '-' }}</span>
                <div :class="$style.textWrap">
                    <!-- 错误提示 -->
                    <span :class="$style.tip" v-show="item.errTips">{{ item.errTips }}</span>
                    <!-- 展开操作 -->
                    <u-link @click="open(index)">展开</u-link>
                </div>
            </div>
            <div v-show="index == current">
                <div :class="$style.operate">
                    <u-linear-layout>
                        <slot name="operate" :item="item"></slot>
                        <u-link :disabled="disabledDelete" @click="deleteItem(index)">删除</u-link>
                        <u-link @click="close">收起</u-link>
                    </u-linear-layout>
                </div>

                <slot :item="item" :index="index" :random="randoms[index]"></slot>
            </div>
        </div>
        <!-- 存在没有初始项的情况，需要设置宽度 -->
        <u-form-table-add-button :class="$style.addButton" v-if="needAdd" :size="size" :is-container="true" :disabled="disabledAdd" @click="add">{{ addBtnInfo.text }}{{ disabledAdd ? `（最多添加${addBtnInfo.max}个）` : '' }}</u-form-table-add-button>
    </u-linear-layout>
</template>
<style module>
.root{
	position: relative;
    padding: 40px 15px;
    border: 1px solid #e1e8ed;
}
.root[size="normal"]{width:800px;}
.root[size="small"] {width: 700px;}
.root[size="affinity"] {width: 630px;}
.addButton[size="affinity"] {width: 630px;}

.root[mini]:hover {
    box-shadow: 0 0 10px 0 rgb(80, 90, 109, .16);
    cursor: pointer;
}

.root[mini] {
    padding: 0 15px;
    background: #f6f7fb;
}

.root[noborder] {
    border: 0;
    padding: 0;
}

.mini {
    padding: 13px 5px 13px 10px;
}

.rootName {
    margin-left: 10px;
    display: inline-block;
    line-height: 30px;
    max-width: calc(100% - 80px);
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.operate {
    position: absolute;
    top: 13px;
    right: 20px;
}

.desc {
    display: inline-block;
    max-width: 580px;
    color: #999;
    padding-bottom: 10px;
}

.textWrap {
    float: right;
    line-height: 30px;
}

.tip {
    display: inline-block;
    margin-right: 40px;
    color: #ff867f;
}

.more {
    margin-left: 45px;
}
</style>
<script>

export default {
    name: 'u-multi-add',
    props: {
        list: Array,
        addBtnInfo: Object,
        miniFormater: Function,
        getDefaultItem: Function,
        getErrorTip: Function,
        needAdd: { type: Boolean, default: true },
        needInit: { type: Boolean, default: true }, // 初始为空时，是否增加一些空项
        canDelete: { type: Boolean, default: true }, // 是否能够支持正常的删除逻辑
        size: String,
    },
    data() {
        return {
            current: 0, // -1 表示全部最小化
            sortList: [],
            isAdd: false,
            randoms: [],
        };
    },
    computed: {
        disabledDelete() {
            // 没有初始化的情况，可以全删除(disabledDelete => false)
            return this.needInit ? (this.canDelete ? this.sortList.length < 2 : true) : false;
        },
        disabledAdd() {
            const { disabledAdd, max } = this.addBtnInfo;
            return disabledAdd !== undefined ? disabledAdd : (this.sortList.length >= this.addBtnInfo.max);
        },
    },
    watch: {
        list(value) {
            this.parseData();
        },
        current(value) {
            // 展开具体某项时，可能有些额外操作.
            // 例如，需要对整体进行一次validate(新加项时，不能validate)
            value >= 0 && this.$emit('open', {
                index: value,
                isAdd: this.isAdd,
            });
            // 重置
            this.isAdd = false;
        },
    },
    created() {
        this.parseData();
    },
    methods: {
        getRandomNum() {
            return Math.ceil(Math.random() * 1000);
        },
        parseData() {
            this.sortList = this.list && this.list.map((item, index) => {
                this.miniFormater && (item.miniText = this.miniFormater(item, index));
                this.randoms.push(this.getRandomNum());
                return item;
            });
            // 当列表为空时，添加第一项
            if (!this.sortList.length && this.needInit) {
                this.add();
            }
        },
        init(){
            if(!this.sortList.length)
                this.add();
        },
        add() {
            const item = this.getDefaultItem && this.getDefaultItem() || {};
            this.randoms.push(this.getRandomNum());
            this.sortList.push(item);
            this.current !== -1 && this.getInfo(this.current);
            this.current = this.sortList.length - 1;
            this.isAdd = true;
            this.$emit('change', {
                list: this.sortList,
            });
        },
        deleteItem(index) {
            this.randoms.splice(index, 1);
            this.sortList.splice(index, 1);
            this.current = index === this.sortList.length ? index - 1 : index;
            this.current !== -1 && (this.sortList[this.current].errTips = '');
            this.$emit('change', {
                list: this.sortList,
            });
        },
        open(index) {
            this.current !== -1 && this.getInfo(this.current);
            this.$nextTick(() => {
                this.current = index;
                this.sortList[this.current].errTips = '';
            });
        },
        close() {
            this.current !== -1 && this.getInfo(this.current);
            this.current = -1;
        },
        getInfo(index) {
            if (index < 0 || (index > this.sortList.length - 1))
                return;
            const item = this.sortList[index];
            if (this.miniFormater) {
                item.miniText = this.miniFormater(item, index);
            }
            item.errTips = this.getErrorTip && this.getErrorTip(item);
        },
    },
};
</script>
