import { Emitter } from 'cloud-ui.vusion';
import * as d3 from 'd3';
import Slider from '../u-slider-scale.vue';

export default {
    name: 'u-topo',
    mixins: [Emitter],
    components: {
        [Slider.name]: Slider,
    },
    props: {
        config: Object,
    },
    data() {
        // 1~24分别对应0.60~1.20
        return {
            svg: undefined,
            width: 1000,
            height: 1000,
            key: new Date().getTime(),
            links: [],
            nodes: [],
            topoNodes: {},
            lines: [],
            linesToNodes: {},
            translateX: 0,
            translateY: 0,
            scale: 0.2,
            zoom: d3.behavior.zoom().scaleExtent([0.20, 1.20]).on('zoom', () => {
                this.translateX = d3.event.translate[0];
                this.translateY = d3.event.translate[1];
                this.scale = d3.event.scale;
            }),
        };
    },
    computed: {
        transform() {
            return `translate(${this.translateX},${this.translateY}) scale(${this.scale})`;
        },
        sliderValue() {
            return this.scale * 20;
        },
    },
    created() {
        this.$on('add-node', (params) => {
            const { dom, node, sender } = params;
            if (sender.completeAdd)
                sender.completeAdd(this);
            d3.select(dom).call(sender.dragMethod(node, sender));
            sender.$on('drag', (event) => {
                const { x, y } = event;
                const topoId = node.topoId;
                const lines = this.linesToNodes[topoId] || [];
                lines.forEach((line) => {
                    if (line.update instanceof Function)
                        line.update(topoId, x, y);
                });
            });
            this.setConfig();
        });
        this.$on('add-line', (params) => {
            const { link, sender } = params;
            this.lines.push(sender);
            const { source, target } = link;
            this.updateLineList(sender, source);
            this.updateLineList(sender, target);
            // 这边需要标记一下当前的路径是否是双向调用,双向调用的路径箭头位置会做调整
            // this.markTwoway(source, target);
        });
    },
    mounted() {
        this.handleTopoBg();
        // this.setConfig();
    },
    methods: {
        resetNodeAndLink() {
            this.key = new Date().getTime();
            this.links = [];
            this.nodes = [];
            this.topoNodes = {};
            this.lines = [];
            this.linesToNodes = {};
        },
        handleTopoBg() {
            d3.select(this.$refs.background)
                .on('click', () => { this.$emit('background-click'); })
                .call(this.zoom);
        },
        setConfig() {
            // if (typeof this.config.nodeCanClick === 'boolean') {
            //     $serviceEvent.$emit('set-click', this.config.nodeCanClick);
            // }
        },
        scaleChange($event) {
            this.transformSvg(this.translateX, this.translateY, $event.value / 20);
        },
        draw(nodes, links) {
            // 重置之前的links 和 nodes 并更新key，重新绘制所有节点
            this.resetNodeAndLink();
            // 更新svg尺寸
            this._getSvgSize();
            // 标记双向link
            this._getTowWay(links);
            // 指定force起始位置
            this._layout(nodes, links);
            this._optimizLinkLength(links);
            this._optimizNodeCoordinate(nodes);
            const force = d3.layout.force().size([this.width, this.height]).nodes(nodes).links(links).charge(-20000).gravity(0.5).linkDistance(240).start();
            this.nodes = nodes;
            this.links = links;
            for (let i = 0; i < 500; i++)
                force.tick();
            nodes.forEach((node) => {
                node.fixed = true;
            });

            force.on('tick', () => {
                this.nodes = Array.from(this.nodes);
                this.links = Array.from(this.links);
            });
        },
        _getSvgSize() {
            // 根据svg的实际宽高计算除去图表的小区域宽高，即力场分布的初始宽高
            const svg = this.$refs.svg;
            this.width = svg ? svg.clientWidth : 0;
            this.height = svg ? svg.clientHeight : 0;
        },
        /**
         * 双向连接标记
         */
        _getTowWay(links) {
            for (let i = 0; i < links.length; i++) {
                for (let j = i + 1; j < links.length; j++) {
                    if (links[i].source === links[j].target && links[i].target === links[j].source)
                        links[i].twoWay = links[j].twoWay = true;
                }
            }
        },
        /**
         * 节点连接位置优化
         */
        _optimizLinkLength(links) {
            links.forEach((link) => {
                if (link.twoWay && link.source.mainNode) {
                    if (link.target._linkCount <= 2) {
                        link.target.x = link.source.x + 4 / 3 * (link.target.x - link.source.x);
                        link.target.y = link.source.y + 4 / 3 * (link.target.y - link.source.y);
                    } else if (link.source._linkCount <= 2) {
                        link.source.x = link.target.x + 4 / 3 * (link.source.x - link.target.x);
                        link.source.y = link.target.y + 4 / 3 * (link.source.y - link.target.y);
                    }
                }
                const distance = Math.sqrt((link.target.x - link.source.x) * (link.target.x - link.source.x) + (link.target.y - link.source.y) * (link.target.y - link.source.y));
                let minDistance = 280;
                if (link.twoWay && (link.source.mainNode || link.target.mainNode)) {
                    minDistance = 460;
                }
                if (distance < minDistance) {
                    if (link.target._linkCount === 1) {
                        link.target.x = link.source.x + minDistance / distance * (link.target.x - link.source.x);
                        link.target.y = link.source.y + minDistance / distance * (link.target.y - link.source.y);
                    } else if (link.source._linkCount === 1) {
                        link.source.x = link.target.x + minDistance / distance * (link.source.x - link.target.x);
                        link.source.y = link.target.y + minDistance / distance * (link.source.y - link.target.y);
                    } else {
                        link.source.x = link.target.x + minDistance / distance * (link.source.x - link.target.x);
                        link.source.y = link.target.y + minDistance / distance * (link.source.y - link.target.y);
                    }
                }
            });
        },
        /**
         * node节点位置优化
         */
        _optimizNodeCoordinate(nodes) {
            const minX = Math.min.apply(null, nodes.map((node) => node.x)) - 50;
            const maxX = Math.max.apply(null, nodes.map((node) => node.x)) + 50;
            const minY = Math.min.apply(null, nodes.map((node) => node.y)) - 50;
            const maxY = Math.max.apply(null, nodes.map((node) => node.y)) + 50;
            const realWidth = maxX - minX;
            const realHeight = maxY - minY;

            // 先计算出待缩放的比例
            let initScale = Math.floor(Math.min(this.width / realWidth, this.height / realHeight) * 20);
            // 1~24分别对应0.60~1.20
            initScale = Math.max(12, Math.min(initScale, 20));

            const scaleWidth = this.width / (initScale / 20);
            const scaleHeight = this.height / (initScale / 20);

            // 再计算出要偏移的位置，如果比区域小则居中，如果比区域大则靠左上
            const adjustX = realWidth >= scaleWidth ? -minX : (scaleWidth - realWidth) / 2 - minX;
            const adjustY = realHeight >= scaleHeight ? -minY : (scaleHeight - realHeight) / 2 - minY;

            nodes.forEach((node) => {
                node.x += adjustX;
                node.y += adjustY;
            });
            this.transformSvg(0, 0, initScale / 20);
        },
        /**
         * 力场散射排布
         */
        _layout(nodes, links) {
            const _services = [];
            const _others = [];
            let services = [];
            let others = [];
            // 分类
            nodes.forEach((node, index) => {
                node.topoId = index;
                if (node.mainNode) // 后者是调用链中的
                    _services.push(node);
                else
                    _others.push(node);
                node._linkCount = 0;
                node._linkSourceCount = 0;
            });

            links.forEach((link) => {
                if (link.twoWay)
                    link.target._twoWay = true;
                link.source._linkSourceCount++;
                link.source._linkCount++;
                link.target._linkCount++;
            });

            services = _services;
            others = _others.sort((a, b) => b._twoWay ? 1 : 0);

            const GRID_X = 200;
            const GRID_Y = 200;

            services.forEach((service, index) => {
                service.x = GRID_X * 0.6;
                service.y = GRID_Y * (0.5 + index);
            });
            others.forEach((other, index) => {
                other.x = GRID_X * 1.6;
                other.y = GRID_Y * (0.5 + index);
            });
        },
        updateLineList(sender, node) {
            const sourceId = node.topoId;
            if (!this.linesToNodes[sourceId])
                this.linesToNodes[sourceId] = [];
            const sourceLines = this.linesToNodes[sourceId];
            if (sourceLines.indexOf(sender) === -1)
                sourceLines.push(sender);
        },
        markTwoway(source, target) {
            const lines = this.getLinks(source, target);
            if (lines.length >= 2) {
                lines.forEach((line) => {
                    line.twoWay = true;
                });
            }
        },
        getLinks(source, target) {
            // 获取连接两点的路径的路径
            const sourceId = source.topoId;
            const sourceLines = this.linesToNodes[sourceId] || [];
            const targetId = target.topoId;
            const targetLines = this.linesToNodes[targetId] || [];
            const lines = [];
            sourceLines.forEach((line) => {
                if (targetLines.indexOf(line) !== -1)
                    lines.push(line);
            });
            return lines;
        },
        transformSvg(x, y, cale) {
            this.zoom.translate([x, y]).scale(cale);
            this.zoom.event(d3.select(this.$refs.background));
        },
    },
};
