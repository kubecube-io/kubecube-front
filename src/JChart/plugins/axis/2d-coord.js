import {
    mat2d, vec2,
} from 'gl-matrix';
// import { reactive } from '@vue/reactivity';
import { REFERENCE_TYPE } from '../../shared/utils';
// import { getYAxis, getXAxis, getXAxisDiscrete, rountToRange } from './utils';
import { animate } from '../../animation/Animate';
class Coord2D {
    constructor(options) {
        this.name = 'Coord2D';
        this.options = Object.assign({
            type: 'vertical',
        }, options);

        this.animationContext = {
            yAxis: [],
        };
    }

    apply(globalCtx) {
        globalCtx.Coordinate.hooks.initCoord.tap(this.name, () => {
            this.init(globalCtx);
        });
        globalCtx.Coordinate.hooks.renderCoord.tap(this.name, (context2d, rdata) => {
            this.render(context2d, rdata, globalCtx);
        });
        globalCtx.Coordinate.hooks.afterRenderChart.tap(this.name, context2d => {
            this.afterRender(context2d, globalCtx);
        });
    }

    init(globalCtx) {
        globalCtx.effect(() => {
            // console.log('2d coord effect');
            const {
                legend,
            } = globalCtx.globalData.source;

            const {
                xMeta,
                yMeta,
            } = globalCtx.globalData.sourceMeta;

            // 没有可显示的legend 不需要重绘坐标系
            const disabledNum = legend.filter(l => l.disabled).length;
            const legendNum = legend.length;
            // // console.log(disabledNum === legendNum, legend);
            if (disabledNum === legendNum) {
                return;
            }

            const {
                translateMtx,
                translateMtxInvert,
                spanHorizontal: layoutsh,
                spanVertical: layoutsv,
                xFloat,
                xScaler,
                yStep,
                yScaler,
            } = globalCtx.Layout;
            const {
                axisBottomArea,
            } = globalCtx.fontInWrapper;


            // // console.log(globalCtx.globalData.source, xMeta, yMeta)
            /**
                (0,0) -> (0,height)
                (1,1) - （1,height-1)
            **/
            // noDPI + layout + 坐标系方向切换
            let mtx;
            let spanHorizontal;
            let spanVertical;
            globalCtx.Coordinate.type = this.options.type;
            if (this.options.type === 'vertical') {
                spanHorizontal = layoutsh;
                spanVertical = layoutsv;
            }
            if (this.options.type === 'horizontal') {
                spanHorizontal = layoutsv;
                spanVertical = layoutsh;
            }
            if (this.options.type === 'vertical') {
                mtx = mat2d.fromValues(1, 0, 0, -1, 0, spanVertical);
            }
            if (this.options.type === 'horizontal') {
                mtx = mat2d.fromValues(0, -1, 1, 0, 0, spanHorizontal);
            }

            const imtx = mat2d.create();
            mat2d.invert(imtx, mtx);
            mat2d.multiply(imtx, imtx, translateMtxInvert);
            // const mtx = mat2d.fromValues(0, -1, 1, 0, 0, spanHorizontal);
            mat2d.multiply(mtx, translateMtx, mtx);


            // widthDPI
            const a = mat2d.create();
            const ia = mat2d.create();
            mat2d.multiply(a, globalCtx.DPIMat, mtx);
            mat2d.invert(ia, a);

            // origin point ( left top point )
            const originVec = vec2.fromValues(0, 0);
            vec2.transformMat2d(originVec, originVec, imtx);

            // origin point ( right bottom point )
            const borderVec = vec2.fromValues(spanHorizontal, spanVertical);
            vec2.transformMat2d(borderVec, borderVec, imtx);

            //
            /* const xFloat = 10; // 横轴坐标距原点偏移

            // let xValues = xMeta.values;
            // let xStep;
            let x_scaler;
            if (reference.type === REFERENCE_TYPE.continuous) {
                // 连续型
                // xValues = getXAxis(xMeta.min, xMeta.max, xSpan);
                // // console.log(xValues);
                xStep = (spanHorizontal - xFloat * 2) / (xValues.length - 1);
                x_scaler = (spanHorizontal - xFloat * 2) / (xMeta.max - xMeta.min);
            }

            if (reference.type === REFERENCE_TYPE.discrete) {
                // 离散型
                // TODO
                // xValues = getXAxisDiscrete(reference.ref, xSpan);
                // // console.log(xValues);
                xStep = x_scaler = (spanHorizontal - xFloat * 2) / (reference.ref.length - (this.options.xAxis.type === 'point' ? 1 : 0));
                xMeta.min = 0;
                xMeta.max = reference.ref.length - 1;
            }
            if (stack) {
                // TODO
                // stack模式下从0开始计算
                // yMeta.min = 0;
            }
            const yStep = spanVertical / (yMeta.values.length - 1);
            // y 范围
            const y_scaler = spanVertical / (yMeta.max - yMeta.min);
            // // console.log(yValues, yMeta);*/
            const dx2x = x => (x - xMeta.min) * xScaler + xFloat;
            const dy2y = y => (y - yMeta.min) * yScaler;
            // const x2dx = x => (x - xFloat) / x_scaler + xMeta.min;
            // const y2dy = y => y / y_scaler + yMeta.min;
            // // console.log('dataMeta', this.dataMeta);
            // Object.assign(this.dataMeta, {
            //     dx2x,
            //     dy2y,
            //     x2dx,
            //     y2dy,
            //     yValues,
            //     yStep,
            //     xValues,
            //     xStep,
            //     xFloat,
            //     x_scaler,
            // });
            Object.assign(globalCtx.Coordinate.transformMeta, {
                originVec,
                borderVec,
                xAxisY: Math.max(0, dy2y(0)),
                transformMtxRaw: mat2d.clone(mtx),
                transformMtxRawInvert: mat2d.clone(imtx),
                transformMtx: mat2d.clone(a),
                transformMtxInvert: mat2d.clone(ia),
                // convertDataToCoord: this.convertDataToCoord.bind(this),
                convertDataToCoordX: dx2x,
                convertDataToCoordY: dy2y,
                // convertCoordToDataX: x2dx,
                // convertCoordToDataY: y2dy,
            });

            if (!this.animationContext.startEnd) {
                yMeta.values.forEach((target, idx) => {
                    const value = yStep * idx;
                    const vec = vec2.fromValues(-axisBottomArea, value);
                    vec2.transformMat2d(vec, vec, mtx);
                    this.animationContext.yAxis.push({
                        name: target,
                        value,
                        fontvecX: vec[0],
                        fontvecY: vec[1],
                    });
                });
                this.animationContext.xAxisY = Math.max(0, dy2y(0));
            }
        });
    }

    convertDataToCoord(dx, dy) {
        return {
            x: this.dataMeta.dx2x(dx),
            y: this.dataMeta.dy2y(dy),
        };
    }

    drawGrid(ctx, globalCtx) {
        const {
            spanHorizontal,
        } = globalCtx.Layout;
        const {
            horizontal,
        } = this.options.grid;

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#eee';
        if (horizontal) {
            ctx.functionCallWithLooping(
                () => {
                    return this.animationContext.yAxis;
                },
                (ctx, loopTarget, v) => {
                    ctx.beginPath();
                    ctx.moveTo(0, v.value);
                    ctx.lineTo(spanHorizontal, v.value);
                    ctx.stroke();
                });
            // for (let l = 1; l <= yValues.length; l++) {
            //     ctx.beginPath();
            //     ctx.moveTo(0,  yStep * l);
            //     ctx.lineTo(spanHorizontal, yStep * l);
            //     ctx.stroke();
            // }
            // ctx.beginPath();
            // ctx.moveTo(blockWidth - 1, 0);
            // ctx.lineTo(blockWidth - 1, graphHeight);
            // ctx.stroke();
        }

        // if (vertical) {
        //     for (let i = 0; i < xValues.length; i++) {

        //     }
        // }


    }

    drawAxis(ctx, globalCtx) {
        // const {
        //     dx2x,
        //     // dy2y,
        //     xValues,
        //     xStep,
        //     xFloat,
        // } = this.dataMeta;
        const {
            xMeta,
            yMeta,
        } = globalCtx.globalData.sourceMeta;
        const DPIMat = globalCtx.DPIMat;
        const {
            spanHorizontal,
            spanVertical,
            xStep,
            xFloat,
        } = globalCtx.Layout;
        const {
            transformMtxRaw,
            convertDataToCoordX,

        } = globalCtx.Coordinate.transformMeta;
        const {
            fontSize,
        } = globalCtx.fontInWrapper;
        const reference = globalCtx.globalData.source.reference;

        ctx.font = `${fontSize / 1.4}px arial`;
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.4;
        // const xAxisY = Math.max(0, dy2y(0));
        // // console.log(xAxisY);
        // 坐标轴
        const rightmost = spanHorizontal - xFloat;
        ctx.beginPath();
        ctx.functionCallWithDynamicParameter('moveTo',
            spanHorizontal,
            () => this.animationContext.xAxisY);
        ctx.functionCallWithDynamicParameter('lineTo',
            0,
            () => this.animationContext.xAxisY);
        // ctx.moveTo(spanHorizontal, xAxisY);
        // ctx.lineTo(0, xAxisY);
        ctx.stroke();


        ctx.lineWidth = 0.7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // y轴数字
        if (this.options.type === 'horizontal') {
            ctx.textAlign = 'center';
        }
        if (this.options.type === 'vertical') {
            ctx.textAlign = 'right';
        }
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.setTransform(DPIMat[0], DPIMat[1], DPIMat[2], DPIMat[3], DPIMat[4], DPIMat[5]);
        ctx.functionCallWithLooping(
            () => {
                return this.animationContext.yAxis;
            },
            (ctx, loopTarget, v) => {
                const text = yMeta.formatter(v.name);
                ctx.fillText(text, v.fontvecX, v.fontvecY);
            });
        // }
        ctx.restore();

        // x轴数字
        if (this.options.type === 'horizontal') {
            ctx.textAlign = 'right';
        }
        if (this.options.type === 'vertical') {
            ctx.textAlign = 'center';
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#e8e8e8';
        // xValues
        const xValues = xMeta.values;
        for (let i = 0; i < xValues.length; i++) {
            const xValue = xValues[i];
            const value = xValue.value;
            let x;
            let sx = 0;
            if (reference.type === REFERENCE_TYPE.continuous) {
                x = convertDataToCoordX(value);
            }
            if (reference.type === REFERENCE_TYPE.discrete) {
                x = convertDataToCoordX(xValue.step);
                sx = xStep / 2;
            }
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, spanVertical);

            ctx.stroke();
            ctx.save();
            // if (this.options.xAxis.type === 'point') {
            //     sx = 0;
            // }
            const vec = vec2.fromValues(x + sx, -fontSize);
            vec2.transformMat2d(vec, vec, transformMtxRaw);
            // context.scale(1, -1);
            ctx.setTransform(DPIMat[0], DPIMat[1], DPIMat[2], DPIMat[3], DPIMat[4], DPIMat[5]);
            const text = xMeta.formatter(value);
            ctx.wrapText(text, vec[0], vec[1], xStep / 2, fontSize);
            // ctx.fillText(text,
            //     vec[0],
            //     vec[1]);
            ctx.restore();
        }
        // if (this.options.xAxis.type !== 'point') {
        // ctx.beginPath();
        // ctx.moveTo(spanHorizontal, 0);
        // ctx.lineTo(spanHorizontal, spanVertical);
        // ctx.stroke();
        // }

        if (reference.type === REFERENCE_TYPE.discrete) {
            ctx.beginPath();
            ctx.moveTo(rightmost, 0);
            ctx.lineTo(rightmost, -3);
            ctx.stroke();
        }
    }

    renderWithContext(ctx, globalCtx) {
        ctx.save();
        this.drawGrid(ctx, globalCtx);
        this.drawAxis(ctx, globalCtx);
        ctx.restore();
    }

    render(ctx, rdata, globalCtx) {
        // // console.log('render coord');
        this.color = '#000';
        // const mtx = globalCtx.Coordinate.transformMeta.transformMtx;
        // ctx.setTransform(mtx[0],mtx[1],mtx[2],mtx[3],mtx[4],mtx[5]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#eee';
        this.renderWithContext(ctx, globalCtx);
    }

    afterRender(context2d, globalCtx) {
        const render = context2d.render.bind(context2d);
        globalCtx.effect(() => {
            const {
                axisBottomArea,
            } = globalCtx.fontInWrapper;
            const {
                yMeta,
            } = globalCtx.globalData.sourceMeta;
            const yValues = yMeta.values;
            const {
                yStep,
            } = globalCtx.Layout;
            const {
                transformMtxRaw,
                xAxisY,
            } = globalCtx.Coordinate.transformMeta;
            const animationContext = this.animationContext;
            if (animationContext.startEnd) {
                let promise = Promise.resolve();
                if (animationContext.transformAnime) {
                    animationContext.transformAnime.stop();
                    promise = animationContext.transformAnime;
                }
                promise.then(() => {
                    const newYAxs = [];

                    yValues.forEach((target, idx) => {
                        const value = yStep * idx;
                        const vec = vec2.fromValues(-axisBottomArea, value);
                        vec2.transformMat2d(vec, vec, transformMtxRaw);
                        newYAxs.push({
                            name: target,
                            value,
                            fontvecX: vec[0],
                            fontvecY: vec[1],
                        });
                    });
                    const oldYAxis = animationContext.yAxis;
                    // const animeNeed = intersectionBy(
                    //     newAnimationContext,
                    //     this.animationContext, d => d.name);
                    const partner = [];
                    newYAxs.forEach((element, idx) => {
                        const name = element.name;
                        const newValue = element.value;
                        const newVecY = element.fontvecY;
                        const oidx = oldYAxis.findIndex(y => y.name === name);
                        if (oidx !== -1) {
                            const op = oldYAxis[oidx];
                            const oldValue = op.value;
                            const oldVecY = op.fontvecY;

                            partner.push({
                                getter: () => oldValue,
                                setter: v => { this.animationContext.yAxis[idx].value = v; },
                                to: newValue,
                            });
                            element.value = oldValue;

                            partner.push({
                                getter: () => oldVecY,
                                setter: v => { this.animationContext.yAxis[idx].fontvecY = v; },
                                to: newVecY,
                            });
                            element.fontvecY = oldVecY;
                            // fontvecX: vec[0],
                            // fontvecY: vec[1],
                        }
                    });
                    partner.push({
                        getter: () => this.animationContext.xAxisY,
                        setter: v => { this.animationContext.xAxisY = v; },
                        to: xAxisY,
                    });

                    this.animationContext.yAxis = newYAxs;

                    this.animationContext.transformAnime = animate(
                        {
                            partner,
                            animation: {
                                duration: 550,
                                easing: 'easeInQuad',
                            },
                            render,
                        });
                });
            }
        });

        if (!this.animationContext.startEnd) {
            context2d.render();
            this.animationContext.startEnd = true;
        }
    }
}

export default Coord2D;
