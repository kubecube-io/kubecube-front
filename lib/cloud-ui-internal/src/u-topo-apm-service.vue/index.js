import Vue from 'vue';
import { Emitter } from 'cloud-ui.vusion';
import TopoNode from '../u-topo-node.vue';
// import Count from './u-count.vue';
import filters from '../utils/filters/apm.js';
import * as d3 from 'd3';
import i18n from './i18n';

const $event = new Vue();
export default {
    filters,
    name: 'u-topo-apm-service',
    components: {
        [TopoNode.name]: TopoNode,
        // [Count.name]: Count,
    },
    i18n,
    mixins: [Emitter],
    props: {
        node: Object,
        disabled: Boolean,
        isSnap: Boolean,
    },
    data() {
        return {
            showButton: false,
            isDrag: false,
            isHover: false,
            canClick: !this.disabled, // 服务拓扑图点击不弹详情
            type: ['test', 'warn', 'stallWarn', 'offLine'],
            clickTimeId: undefined,
        };
    },
    watch: {
        disabled(value) {
            this.canClick = value;
        },
    },
    created() {
        $event.$on('set-off', this.setOff);
        $event.$on('set-click', this.setClick);
    },
    mounted() {
        this.nodeClick();
        this.nodeHover();
        this.buttonClick();
    },
    beforeDestroy() {
        $event.$off('set-off', this.setOff);
        $event.$off('set-click', this.setClick);
    },
    methods: {
        setOff(vm) {
            if (this !== vm)
                this.showButton = false;
        },
        setClick(val) {
            this.canClick = val;
        },
        nodeClick() {
            d3.select(this.$refs.head).on('dblclick', () => {
                this.$emit('dblclick', this.node.id);
                d3.event.stopPropagation();
                clearTimeout(this.clickTimeId);
                if (!this.canClick)
                    return;
                this.$emit('link-to', {
                    service: this.node.id,
                });
            }).on('click', () => {
                if (!this.isDrag)
                    this.$emit('single-click', this.node);
                $event.$emit('set-off', this);
                clearTimeout(this.clickTimeId);
                this.clickTimeId = setTimeout(() => {
                    const isDrag = this.isDrag;
                    if (isDrag)
                        this.isDrag = false;
                    if (!this.canClick)
                        return;
                    if (!isDrag) {
                        this.showButton = true;
                    }
                }, 300);
            });
        },
        nodeHover() {
            d3.select(this.$refs.head).on('mouseenter', (node) => {
                this.isHover = true;
            }).on('mouseleave', (node) => {
                this.isHover = false;
            });
        },
        buttonClick() {
            d3.select(this.$refs.button).on('click', () => {
                this.$emit('link-to', {
                    service: this.node.id,
                });
            });
        },
        nodeComplete(parent) {
            parent.$on('background-click', () => {
                $event.$emit('set-off');
            });
        },
    },

};
