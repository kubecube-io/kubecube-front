import { effect, reactive } from '@vue/reactivity';
import { initSchedule } from './schedule';
import {
    SyncHook,
} from 'tapable';

import {
    mat2d,
    vec2,
} from 'gl-matrix';
import proxyContext from './animation/contextProxy.js';

// import DataPlugin from './plugins/data/2d-data';
// import Data from './instance/Data';
import DPIPlugin from './plugins/inner/DPIPlugin';
import LayoutPlugin from './plugins/inner/LayoutPlugin';
import EventListenerPlugin from './plugins/inner/EventListenerPlugin';
import HitTestPlugin from './plugins/inner/HitTestPlugin';
import FontPlugin from './plugins/inner/FontPlugin';
import ThemePlugin from './plugins/inner/ThemePlugin';


class Data {
    constructor() {
        this.source = reactive({});
        this.sourceMeta = reactive({});

        this.hooks = Object.freeze({
            initData: new SyncHook([ 'dataOptions', 'source', 'sourceMeta' ]),
            afterInitData: new SyncHook(),
            resetData: new SyncHook([ 'dataOptions', 'source', 'sourceMeta' ]),
        });
    }

    init(dataOptions) {
        this.hooks.initData.call(dataOptions, this.source, this.sourceMeta);
        this.hooks.afterInitData.call();
    }

    resetData(dataOptions) {
        this.hooks.resetData.call(dataOptions, this.source, this.sourceMeta);
    }
}


class BaseContext {
    get context2d() {
        return this._context2d;
    }
    get canvasElm() {
        return this._canvasElm;
    }
    set context2d(val) {
        if (this._context2d) {
            throw 'you cannot replace context2d!';
        }
        this._context2d = val;
    }
    set canvasElm(val) {
        if (this._canvasElm) {
            throw 'you cannot replace canvasElm!';
        }
        this._canvasElm = val;
    }

    get canvasCacheImage() {
        const width = this._canvasElm.width;
        const height = this._canvasElm.height;
        return this.context2d.createImageData(width, height);
    }
}

class Coordinate extends BaseContext {
    constructor(queueJob) {
        super(queueJob);
        this.hooks = {
            initCoord: new SyncHook(),
            renderCoord: new SyncHook([ 'context2d', 'rdata' ]),
            afterRenderChart: new SyncHook([ 'context2d' ]),
        };
        // this.convert = reactive({
        //     convertDataToCoord: () => ({x: 0, y: 0}),
        //     convertCoordToDataX: () => 0;
        // })
        this.transformMeta = reactive({
            originVec: vec2.create(),
            borderVec: vec2.create(),
            transformMtxRaw: mat2d.create(),
            transformMtxRawInvert: mat2d.create(),
            transformMtx: mat2d.create(),
            transformMtxInvert: mat2d.create(),
            convertDataToCoordX: undefined,
            convertDataToCoordY: undefined,
            // convertCoordToDataX: undefined,
            // convertCoordToDataY: undefined,
            // convertDataToCoord: undefined,
            x_scaler: 1,
            xFloat: 0,
            // spanHorizontal: undefined,
            // spanVertical: undefined,
            formatFunc: {
                xFormat: x => x,
            },
        });
    }

    init() {
        this.hooks.initCoord.call();
    }

    render(rdata) {
        this.hooks.renderCoord.call(this.context2d, rdata);
    }

    afterRender() {
        this.hooks.afterRenderChart.call(this.context2d);
    }
}

class Chart extends BaseContext {
    constructor(queueJob) {
        super(queueJob);
        this.hooks = {
            initChart: new SyncHook(),
            renderChart: new SyncHook([ 'context2d', 'rdata' ]),
            afterRenderChart: new SyncHook([ 'context2d' ]),
        };
        this.chartMeta = reactive({
            seriesInCoord: [], // 数据经过坐标系变换厚的位置
            seriesMeta: [], // 元数据信息
            legendXInCoord: {}, // 以x为索引的数据 x: [series1, series2, ... ]
            xSeries: [], // x索引列表
            indexMapping: [], // legend过滤后序列图
            focused: undefined, // 当前聚焦数据集
            lastFocused: undefined, // 上一次聚焦数据集
            focusSource: undefined,
        });
    }

    init() {
        this.hooks.initChart.call();
    }

    render(rdata) {
        this.hooks.renderChart.call(this.context2d, rdata);
    }

    afterRender() {
        this.hooks.afterRenderChart.call(this.context2d);
    }
}

class Overlayer extends BaseContext {
    constructor(queueJob) {
        super(queueJob);
        this.hooks = {
            registOverlayer: new SyncHook(),
            initOverlayer: new SyncHook([ 'container' ]),
            renderOverLayer: new SyncHook([ 'context2d' ]),
            afterRenderChart: new SyncHook([ 'context2d' ]),
        };

        this.overLayerMeta = reactive({
            focus: undefined, // 聚焦的类别
        });
        this.registedRenderFunction = [];
        this.initFunctionCache = [];
        this.tempCache = {};
    }

    registElement() {
        this.hooks.registOverlayer.call();
    }

    init(container) {
        this.hooks.initOverlayer.call(container);
    }

    setTransform(ctx, globalCtx) {
        const mtx = globalCtx.Coordinate.transformMeta.transformMtx;
        ctx.setTransform(mtx[0], mtx[1], mtx[2], mtx[3], mtx[4], mtx[5]);
    }

    render() {
        this.hooks.renderOverLayer.call(this.context2d);
    }

    afterRender() {
        this.hooks.afterRenderChart.call(this.context2d);
    }
}


class GlobalContext {
    constructor(queueJob) {
        this._scheduler = queueJob;
        // this.globalData = globalData;
        this.boundingBox = reactive({
            width: 0,
            height: 0,
        });
        this.theme = reactive({
            series: [],
        });
        this._mouse = reactive({
            x: undefined,
            y: undefined,
            event: undefined,
        });

        this.Layout = reactive({
            translateMtx: undefined,
            translateMtxInvert: undefined,
            spanHorizontal: undefined,
            spanVertical: undefined,
        });

        this.hooks = Object.freeze({
            initTheme: new SyncHook(),
            initContext: new SyncHook([ 'context', 'canvasElem', 'container' ]),
        });
        this.globalData = new Data(queueJob);
        this.Coordinate = new Coordinate(queueJob);
        this.Chart = new Chart(queueJob);
        this.Overlayer = new Overlayer(queueJob);
    }

    init(container, dataOptions) {

        this.hooks.initTheme.call();
        const {
            context2d: coord_context,
            canvas: coord_canvas,
        } = createCanvas(container);
        const {
            context2d: chart_context,
            canvas: chart_canvas,
        } = createCanvas(container);
        const {
            context2d: overlayer_context,
            canvas: overlayer_canvas,
        } = createCanvas(container);
        this.container = container;
        const box = container.getBoundingClientRect();
        this.boundingBox.width = box.width;
        this.boundingBox.height = box.height;
        const coordContextProxy = new proxyContext(coord_context, true);
        const chartContextProxy = new proxyContext(chart_context, true);
        const overlayerContextProxy = new proxyContext(overlayer_context, true);
        // const overContextProxy = new proxyContext(overlayer_context, true);

        // chartContextProxy.debug = true;
        this.hooks.initContext.call(coordContextProxy, coord_canvas, container);
        this.hooks.initContext.call(chartContextProxy, chart_canvas, container);
        this.hooks.initContext.call(overlayerContextProxy, overlayer_canvas, container);

        this.Coordinate.context2d = coordContextProxy;
        this.Coordinate.canvasElm = coord_canvas;
        this.Chart.context2d = chartContextProxy;
        this.Chart.canvasElm = chart_canvas;
        this.Overlayer.context2d = overlayerContextProxy;
        this.Overlayer.canvasElm = overlayer_canvas;

        this.globalData.init(dataOptions);
        this.Overlayer.registElement();
        this.Coordinate.init();
        this.Chart.init();
        this.Overlayer.init(container);
    }

    clearCanvas(ctx, canvasElem) {
        ctx.clearCommands && ctx.clearCommands();
        const width = canvasElem.width;
        const height = canvasElem.height;
        ctx.setTransform();
        ctx.clearRect(0, 0, width, height);
    }

    setTransform(ctx) {
        const mtx = this.Coordinate.transformMeta.transformMtx;
        ctx.setTransform(mtx[0], mtx[1], mtx[2], mtx[3], mtx[4], mtx[5]);
    }

    render() {
        this.effect(() => {
            const {
                context2d,
                canvasElm,
            } = this.Coordinate;
            this.clearCanvas(context2d, canvasElm);
            this.setTransform(context2d);
            this.Coordinate.render();
        });
        this.effect(() => {
            const {
                context2d,
                canvasElm,
            } = this.Chart;
            this.clearCanvas(context2d, canvasElm);
            this.setTransform(context2d);
            this.Chart.render();
        });
        this.effect(() => {
            const {
                context2d,
                canvasElm,
            } = this.Overlayer;
            this.clearCanvas(context2d, canvasElm);
            this.setTransform(context2d);
            this.Overlayer.render(this);
        });

        this.Coordinate.afterRender();
        this.Chart.afterRender();
        this.Overlayer.afterRender(this);
    }

    effect(fn) {
        effect(fn, {
            scheduler: this._scheduler,
        });
    }

    resetData(options) {
        this.globalData.resetData(options);
    }
    destroy() {
        destroyCanvas(this.container, this.Overlayer.canvasElm);
        destroyCanvas(this.container, this.Chart.canvasElm);
        destroyCanvas(this.container, this.Coordinate.canvasElm);
    }
}

function initChart(plugins, options = {}) {
    const {
        queueJob,
        nextTick,
    } = initSchedule();
    // const globalData = new Data(options.data, queueJob);
    // // console.log(globalData)
    const globalCtx = new GlobalContext(queueJob);
    globalCtx.$nextTick = nextTick;
    const innerPlugins = [
        new DPIPlugin(),
        new ThemePlugin(options.theme),
        FontPlugin,
        new LayoutPlugin(options.layout),
        new EventListenerPlugin(),
        HitTestPlugin,
    ];

    plugins = innerPlugins.concat(plugins);
    plugins.forEach(plugin => {
        plugin.apply(globalCtx);
    });
    return globalCtx;
}


function createCanvas(container) {
    const canvasElem = document.createElement('canvas');
    const rect = container.getBoundingClientRect();
    canvasElem.width = rect.width;
    canvasElem.height = rect.height;
    container.appendChild(canvasElem);
    canvasElem.style.position = 'absolute';
    const context2d = canvasElem.getContext('2d');
    return { canvas: canvasElem, context2d };
}

function destroyCanvas(container, canvas) {
    container.removeChild(canvas);
}
export default function VegoChart(plugins, options) {
    const globalCtx = initChart(plugins, options);

    return (container, data) => {
        globalCtx.init(container, data);
        globalCtx.render();
        return globalCtx;
    };
}
