import {
    mat2d,
} from 'gl-matrix';
const DEFAULT_OPTION = {
    left: 0, right: 0, bottom: 0, top: 0,
};
const cacheCanvas = document.createElement('canvas');
const cachhCanvasContext = cacheCanvas.getContext('2d');

class LayoutPlugin {
    constructor(options) {
        this.name = 'layoutPlugin';
        this.options = Object.assign({}, DEFAULT_OPTION, options);
        // console.log(this.options);
    }
    apply(globalCtx) {
        globalCtx.globalData.hooks.afterInitData.tap(this.name, () => {
            globalCtx.effect(() => {
                // console.log('layout effect');
                const rect = globalCtx.boundingBox;
                const {
                    left, right, bottom, top,
                    xFloat = 10,
                } = this.options;

                let yTextWidth = 0;
                const {
                    yMeta,
                    xMeta,
                } = globalCtx.globalData.sourceMeta;
                // if (globalCtx.globalData.sourceMeta && globalCtx.globalData.sourceMeta.yMeta) {
                    // debugger
                const {
                    fontSize,
                } = globalCtx.fontInWrapper;

                const textmin = yMeta.formatter(yMeta.min);
                const textmax = yMeta.formatter(yMeta.max);
                cachhCanvasContext.save();
                cachhCanvasContext.font = `${fontSize / 1.4}px arial`;
                cachhCanvasContext.lineWidth = 1.4;
                const ytext = textmin.length > textmax.length ? textmin : textmax;
                yTextWidth = cachhCanvasContext.measureText(`${ytext}000`).width;
                // console.log(ytext, yTextWidth);
                cachhCanvasContext.restore();

                const mtx = mat2d.fromValues(1, 0, 0, 1, left + yTextWidth, top);
                const imtx = mat2d.create();
                mat2d.invert(imtx, mtx);
                const spanHorizontal = rect.width - left - right - yTextWidth;
                const spanVertical = rect.height - top - bottom;

                Object.assign(globalCtx.Layout, {
                    translateMtx: mtx,
                    translateMtxInvert: imtx,
                    spanHorizontal,
                    spanVertical,
                    xStep: (spanHorizontal - xFloat * 2) / (xMeta.values.length - 1),
                    xScaler: (spanHorizontal - xFloat * 2) / (xMeta.max - xMeta.min),
                    yStep: spanVertical / (yMeta.values.length - 1),
                    yScaler: spanVertical / (yMeta.max - yMeta.min),
                    rawSpanHorizontal: rect.width - left - right,
                    left: left + yTextWidth,
                    top,
                    bottom: rect.height - bottom,
                    right: rect.width - left - yTextWidth,
                    xFloat,
                });
                // }
            });
        });
    }
}

export default LayoutPlugin;
