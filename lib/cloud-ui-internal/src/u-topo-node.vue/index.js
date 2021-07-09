import { Emitter } from 'cloud-ui.vusion';
import * as d3 from 'd3';

const getEffectTag = (target) => {
    if (target.tagName === 'svg' || !target || !target.getAttribute)
        return false;
    if (target.getAttribute('data-tag') === 'effect')
        return true;
    else
        return getEffectTag(target.parentElement);
};
let isEffect = true;
const dragFunction = (node, sender) => {
    const drag = d3.behavior.drag().on('dragstart', (d) => {
        // 对当前拖动有效区预判，仅有标记data-tag 为effect的元素
        const $event = d3.event.sourceEvent;
        isEffect = getEffectTag($event.target);
    }).on('drag', (d) => {
        if (!sender.canDrag || !isEffect)
            return;
        sender.updateXAndY(d3.event.x, d3.event.y);
    });
    return drag;
};

export default {
    name: 'u-topo-node',
    mixins: [Emitter],
    props: {
        node: Object,
        canDrag: {
            type: Boolean,
            default: true,
        },
        radius: {
            type: Number,
            default: 56,
        },
        devX: {
            type: Number,
            default: 0,
        },
        devY: {
            type: Number,
            default: 0,
        },
        dragMethod: {
            type: Function,
            default: dragFunction,
        },
    },
    data() {
        return {
            x: this.node.x,
            y: this.node.y,
            parent: undefined,
            // canDrag: true,
        };
    },
    mounted() {
        this.dispatch('u-topo', 'add-node', {
            sender: this,
            node: this.node,
            dom: this.$refs.node,
        });
    },
    computed: {
        XAndY() {
            const node = this.node;
            node.radius = this.radius;
            return `translate(${this.x - node.radius / 2 + this.devX},${this.y - node.radius / 2 + this.devY})`;
        },
    },
    methods: {
        updateXAndY(x, y) {
            this.x = x;
            this.y = y;
            this.$emit('drag', { x, y });
            // this.node.x = x;
            // this.node.y = y;
        },
        completeAdd(parent) {
            this.parent = parent;
            this.$emit('complete', parent);
        },
    },
};
