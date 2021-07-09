<template>
  <div>
    <slot :displayData="displayData" />
  </div>
</template>

<script>
function getContainerEl(el) {
    let node = el.parentNode;
    while (
        node &&
        node.tagName !== 'HTML' &&
        node.tagName !== 'BODY' &&
        node.nodeType === 1
    ) {
        if (node.hasAttribute('stream-scroll-container')) {
            return node;
        }
        node = node.parentNode;
    }
    return node;
}
const animateMeta = {
    duration: 250,
    t: 0,
    easeOutQuad: t => t * (2 - t),
    startTime: undefined,
    initial: undefined,
    step: undefined,
};
const maxRenderLogs = 50;
const scrollBoundary = 100;
let uniqueKey = 0;
export default {
    props: {
        frequent: Number, // 秒
        loadmoreFn: Function, // 一次性加载所有需要展示的数据
        normalizeData: Function, // 数据正规化
    },
    data() {
        return {
            allData: [],
            displayData: [],
            containeElm: null,
            timer: null,
            startTime: Date.now() - this.frequent * 1000,
            endTime: Date.now(),
            displayDataOffset: 0,
        };
    },
    mounted() {
        const container = getContainerEl(this.$el);
        this.containeElm = container;
        console.log(this.startTime);
        this.loadmore();
        this.engineOn();
        // container.addEventListener('scroll', this.findDataScroll);
    },
    destroyed() {
        clearTimeout(this.timer);
        // this.containeElm.removeEventListener('scroll', this.findDataScroll);
    },
    methods: {
        reload() {
            clearTimeout(this.timer);
            const container = getContainerEl(this.$el);
            this.containeElm = container;
            this.loadmore();
            this.engineOn();
        },
        engineOn() {
            this.timer = setTimeout(() => {
                this.loadmore();
                this.startTime = this.endTime + 1;
                this.endTime = Date.now();
                this.engineOn();
            }, this.frequent * 1000);
        },
        getContainerBound() {
            return this.$el.getBoundingClientRect();
        },
        loadmore() {
            let needAutoPilot = true;
            if (this.containerNotHitBottom()) {
                needAutoPilot = false;
            }
            this.loadmoreFn(this.startTime, this.endTime).then(({ hits }) => {
                const data = hits.map(this.normalizeData);
                data.forEach(d => { d.uniqueKey = uniqueKey++; });
                if (needAutoPilot) {
                    this.allData = this.allData.concat(data);
                    const l = this.allData.length;
                    this.displayData = this.allData.slice(l - maxRenderLogs, l);
                    this.displayDataOffset = l - maxRenderLogs;
                    this.$nextTick(this.scrollToEnd);
                }
            }).catch(err => console.log(err));
        },
        containerHitTop() {

        },
        containerHitBottom() {
            return !this.containerHitBottom();
        },
        containerNotHitBottom() {
            // 是否自动刷新当前页面 ？ 显示的数据位于最后
            if (this.allData.length === 0) return false;
            const b = this.containeElm;
            return b.clientHeight + b.scrollTop < b.scrollHeight - scrollBoundary;
        },
        animation() {
            if (animateMeta.t < animateMeta.duration) {

                animateMeta.t = Date.now() - animateMeta.startTime;
                const p = animateMeta.step * animateMeta.easeOutQuad(animateMeta.t / animateMeta.duration);
                this.containeElm.scrollTo(0, p + animateMeta.initial);
                requestAnimationFrame(this.animation);
            }

        },
        scrollToEnd() {
            const b = this.containeElm;
            if (b.clientHeight + b.scrollTop < b.scrollHeight - 10) {
                animateMeta.startTime = Date.now();
                animateMeta.initial = b.scrollTop;
                animateMeta.step = b.scrollHeight - b.clientHeight;
                animateMeta.t = 0;
                this.animation();
            }
        },
    },
};
</script>

<style>

</style>
