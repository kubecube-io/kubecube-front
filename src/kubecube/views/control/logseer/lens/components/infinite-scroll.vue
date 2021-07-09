<template>
    <div>
        <slot :displayData="displayData"></slot>
    </div>
</template>

<script>
let uniqueKey = 0;
function getContainerEl(el) {
    let node = el.parentNode;
    while (
        node &&
        node.tagName !== 'HTML' &&
        node.tagName !== 'BODY' &&
        node.nodeType === 1
    ) {
        if (node.hasAttribute('infinite-scroll-container')) {
            return node;
        }
        node = node.parentNode;
    }
    return node;
}
export default {
    props: {

        step: Number, // 数据每次加载的条数
        lazyRows: { type: Number, default: 10 }, // 数据每次渲染的条数
        normalizeData: Function, // 数据正规化
        getDefaultData: Function, // 默认数据生成
        loadmoreFn: Function,
    },
    data() {
        return {
            displayData: [],
            offset: 0,
            // slots: [],
            data: [],
            containeElm: null,
            total: 0,
        };
    },
    mounted() {
        const container = getContainerEl(this.$el);
        this.containeElm = container;
        container.addEventListener('scroll', this.infiniteScroll);
        this.refresh();
    },
    beforeDestroy() {
        this.containeElm.removeEventListener('scroll', this.infiniteScroll);
    },
    methods: {
        reload() {
            this.containeElm.removeEventListener('scroll', this.infiniteScroll);
            const container = getContainerEl(this.$el);
            this.containeElm = container;
            container.addEventListener('scroll', this.infiniteScroll);
            this.refresh();
        },
        refresh() {
            const initFakeRows = this.total > this.lazyRows ? this.lazyRows : this.total;
            this.data = [];
            this.displayData = this.data.concat(new Array(initFakeRows).fill(this.getDefaultData()));
            this.offset = 0;
            this.firstLoad();
        },
        infiniteScroll(e) {
            const elm = this.containeElm;
            // console.log(elm.scrollTop, elm.clientHeight, elm.scrollHeight)
            if (elm.scrollTop + elm.clientHeight >= elm.scrollHeight) {
                this.loadMore();
            }
        },
        isContainerNotHitBottom() {
            const containerHeight = this.containeElm.getBoundingClientRect().height;
            const { height } = this.$el.getBoundingClientRect();

            return containerHeight > height;
        },
        formatDATA(d) {
            const t = this.normalizeData(d);
            t.uniqueKey = uniqueKey++;
            return t;
        },
        loadUntilFullScreen() {
            this.$nextTick(() => {
                if (this.isContainerNotHitBottom() && this.offset < this.total) {
                    this.loadMore();
                    this.loadUntilFullScreen();
                }
            });
        },
        firstLoad() {

            const {
                lazyRows, // 一次懒加载的量
                offset, // 当前偏移量
                total, // 总量
                step,
            } = this;
            this.loadmoreFn(this.offset).then(({ hits, total }) => {
                // this.total = total;
                this.data = hits.map(this.formatDATA);
                // 接下来要解决 offset 与 displayData 的赋值
                const l = this.data.length;
                const offset = l;
                if (total > lazyRows) {
                    // 如果总量 >= lazyRows
                    this.displayData = this.data.slice(0, lazyRows);
                    this.offset = lazyRows;
                    this.loadUntilFullScreen();
                } else {
                    // 如果总量 < lazyRows
                    this.displayData = this.data.slice(0, total);
                    this.offset = total;
                }
                this.total = total;
            });
        },
        loadMore() {
            const {
                lazyRows, // 一次懒加载的量
                offset, // 当前偏移量
                total, // 总量
                step,
            } = this;

            const existDataLength = this.data.length;
            let newOffset = offset + lazyRows;
            newOffset = newOffset > total ? total : newOffset;
            if (existDataLength < newOffset) {
                // 将新增的 data 长度
                const remainsRow = total - offset > step ? step : total - offset;

                // 已有的数据长度 与 计算后的偏移量 比较
                const dataPromise = this.loadmoreFn(this.offset);
                dataPromise.then(({ hits, total }) => {
                    this.data.splice(existDataLength, remainsRow, ...hits.map(this.formatDATA));
                    this.total = total;
                    this.displayData = this.data.slice(0, this.offset); // 必须是 this.offset
                }).catch(err => console.log(err));
                this.data = this.data.concat(new Array(remainsRow).fill(this.getDefaultData()));
            }

            this.displayData = this.data.slice(0, newOffset);
            this.offset = newOffset;
        },
    },
};
</script>

<style>

</style>
