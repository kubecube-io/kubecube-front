<template>
    <div>
        <div :class="[$style.wrap, 'f-toe']" :showMoreButton="showMoreButton">
            <span v-if="isEmpty">-</span>
            <span v-else v-for="(item, index) in briefList" :class="[$style.item, isChip ? 'u-chip' : '']" :key="index" :title="isString ? item : item.text">{{ isString ? item : item.text }}</span>
        </div>
        <u-tooltip v-if="showMoreButton">
            <u-link style="padding-left: 5px;">更多</u-link>
            <div slot="content">
                <div v-for="(item, index) in list" :key="index">{{ isString ? item : item.text }}</div>
            </div>
        </u-tooltip>
    </div>
</template>

<style module>
.wrap {
    display: inline-block;
    max-width: 100%;
    vertical-align: middle;
}

.wrap[showMoreButton] {
    max-width: calc(100% - 40px);
}

.item[class] {
    max-width: 100%;
}
</style>

<script>
/**
 * @description 列表中某一项可能有多个unit展示的情况，超过额定项需要隐藏，hover展示所有项
 *              数组中每项为一个对象（对象有一个text字段展示） || 字符串
 */
export default {
    name: 'u-table-cell-items',
    props: {
        max: { type: Number, default: 1 },
        list: { type: Array, default: () => [] },
        isChip: { type: Boolean, default: false }, // 是否为u-chips组件的单元的样式
    },
    computed: {
        length() {
            return this.list.length || 0;
        },
        briefList() {
            return this.list.slice(0, this.max);
        },
        // 数组中的每项是否字符串
        isString() {
            return typeof this.list[0] === 'string';
        },
        showMoreButton() {
            return this.length > this.max;
        },
        isEmpty() {
            return !this.list.length;
        },
    },
    data() {
        return {

        };
    },
}
</script>
