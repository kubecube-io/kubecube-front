import {
    vec2,
} from 'gl-matrix';
import {
    REFERENCE_TYPE,
    distToSegmentSquared,
    pointInPolygon,
    distToBezierSegmentSquared,
    bezierPoints,
} from '../../shared/utils';
import { sum, clone, cloneDeep } from 'lodash';
import { animate } from '../../animation/Animate';
// import { tween } from '../../animation/tween';
import colorString from 'color-string';
import { effect } from '@vue/reactivity';

class LineChart {
    constructor(options) {
        this.name = 'LineChart';
        this.options = Object.assign({
            smooth: false,
            pointRadius: 0,
            fill: false,
        }, options);
        // this.seriesInCoord = reactive([]);
        this.lastLegendState = undefined;
        // this.lineStates = reactive({
        //     focus: null,
        //     index: null,
        // });
        this.stack = false;
        this.animationContext = {
            series: {},
            legends: [],
        };
        this.overlayerAnimeCache = {};

        // this.fillArea = () => {};
    }

    apply(globalCtx) {
        globalCtx.Chart.hooks.initChart.tap(this.name, () => {
            this.init(globalCtx);
        });
        globalCtx.Chart.hooks.renderChart.tap(this.name, context2d => {
            this.render(context2d, globalCtx);
        });
        globalCtx.Chart.hooks.afterRenderChart.tap(this.name, context2d => {
            this.afterRender(context2d, globalCtx);
        });
        globalCtx.Overlayer.hooks.renderOverLayer.tap(this.name, ctx => {
            this.renderIndicator(ctx);
        });
        globalCtx.Overlayer.hooks.afterRenderChart.tap(this.name, ctx => {
            this.afterRenderIndicator(ctx, globalCtx);
        });
    }

    init(globalCtx) {
        globalCtx.effect(() => {
            // console.log('init LineChart');
            const seriesTheme = globalCtx.theme.series;
            const {
                data: series,
                legend,
                stack,
                // stacks,
                reference,
            } = globalCtx.globalData.source;
            const {
                spanHorizontal,
            } = globalCtx.Layout;
            const {
                convertDataToCoordX,
                convertDataToCoordY,
                xFloat,
            } = globalCtx.Coordinate.transformMeta;
            const lastLegendState = this.lastLegendState;
            const seriesInCoord = [];
            const seriesMeta = {};
            // const legendXInCoord = {};
            // let maxY = -Infinity;

            this.animationContext.legends = cloneDeep(legend);
            legend.forEach((d, sid) => {
                const seri = series[sid];
                const lastLgDisabled = !!lastLegendState && lastLegendState[sid];
                const theme = seriesTheme.get(sid);
                if (!this.animationContext.series[d.name]) {
                    this.animationContext.series[d.name] = {
                        clipX: 0,
                        opacity: 1,
                        subOpacity: 0.4,
                        points: [],
                        lastStackPoints: [],
                    };
                }
                const AnimePoints = this.animationContext.series[d.name].points;
                const remainAnimePointLength = AnimePoints.length;

                const pointsLengthDiff = seri.length - remainAnimePointLength;
                if (pointsLengthDiff < 0) {
                    this.animationContext.series[d.name].points = AnimePoints.slice(0, seri.length);
                    const lsp = this.animationContext.series[d.name].lastStackPoints;
                    this.animationContext.series[d.name].lastStackPoints = lsp.slice(0, seri.length);
                    // AnimePoints = this.animationContext.series[d.name].points;
                }
                const isStack = stack;
                seriesInCoord.push({
                    theme,
                    lastLgDisabled,
                    legend: d,
                    isStack,
                    points: seri.map((v, idx) => {
                        const dx = v[0];
                        let dy;
                        let dyraw;
                        let ref;
                        // const isStack = v.length > 2;
                        if (isStack) {
                            // const idx = sid + 2;
                            dyraw = v[3];
                            dy = v[1];
                        } else {
                            dy = dyraw = v[1];
                        }
                        // if (reference.type === REFERENCE_TYPE.discrete) {
                        //     ref = idx;
                        // }
                        if (reference.type === REFERENCE_TYPE.continuous) {
                            ref = dx;
                        }

                        const x = convertDataToCoordX(ref);
                        const y = convertDataToCoordY(dy);
                        const lastY = isStack ? convertDataToCoordY(v[2]) : 0;
                        const p = { x, y, lastY };
                        const lastp = { x, y: lastY };
                        if (!seriesMeta[ref]) {
                            seriesMeta[ref] = {
                                x,
                                series: [],
                            };
                        }
                        seriesMeta[ref].series.push({
                            legend: d,
                            p,
                            dx,
                            dy: dyraw,
                            theme,
                            lastp,
                        });
                        // // console.log()
                        if (idx >= remainAnimePointLength) {
                            if (remainAnimePointLength === 0) {
                                this.animationContext.series[d.name].points.push(clone(p));
                                if (isStack) {
                                    this.animationContext.series[d.name].lastStackPoints.push(clone(lastp));
                                }
                            } else {
                                this.animationContext.series[d.name].points.push({
                                    x: spanHorizontal - xFloat,
                                    y,
                                });

                                if (isStack) {
                                    this.animationContext.series[d.name].lastStackPoints.push({
                                        x: spanHorizontal - xFloat,
                                        y: lastY,
                                    });
                                    // console.log(lastY)
                                }
                            }

                        }
                        // this.animationContext.series[d.name].lastStackPoints.reverse();
                        // maxY = Math.max(maxY, y);
                        return p;
                    }),
                });
            });
            // console.log(seriesInCoord, seriesMeta);
            this.lastLegendState = legend.map(l => l.disabled);
            this.overlayerAnimeCache = {};
            Object.assign(globalCtx.Chart.chartMeta, {
                seriesInCoord,
                seriesMeta: Object.values(seriesMeta).sort((a, b) => a.x - b.x),
                // legendXInCoord,
                // xSeries: Object.keys(legendXInCoord).map(k => +k).sort((a, b) => a-b),
            });

        });

        this.drawLine.bind(this);

        effect(() => {
            // 避免主图多次重绘
            const {
                seriesMeta,
            } = globalCtx.Chart.chartMeta;
            const stack = globalCtx.globalData.source.stack;
            const { x, y, event } = globalCtx._mouse;
            if (event === 'mouseenter') {
                globalCtx.Chart.chartMeta.active = true;
            }
            if (event === 'mouseleave') {
                globalCtx.Chart.chartMeta.active = false;
                globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
                globalCtx.Chart.chartMeta.focused = null;
            }
            if (!globalCtx.Chart.chartMeta.active) return;
            const {
                transformMtxRawInvert,
                xAxisY,
            } = globalCtx.Coordinate.transformMeta;

            const vec = vec2.fromValues(x, y);
            // 鼠标位置变换到当前坐标系下
            vec2.transformMat2d(vec, vec, transformMtxRawInvert);
            const segment = this.findDataInSeries(vec[0], seriesMeta);
            let currLegend;
            if (segment) {
                const [ x, y ] = vec;
                const {
                    curr, next,
                } = segment;
                const l = curr.series.length;
                const cs = curr.series;
                const ns = next.series;
                let sfocus = null;
                if (stack && this.options.fill) {
                    for (let i = 0; i < l; i++) {
                        const b1 = [ cs[i].p.x, cs[i].p.y ];
                        const b2 = cs[i - 1] ? [ cs[i - 1].p.x, cs[i - 1].p.y ] : [ curr.x, xAxisY ];

                        const c1 = [ ns[i].p.x, ns[i].p.y ];
                        const c2 = ns[i - 1] ? [ ns[i - 1].p.x, ns[i - 1].p.y ] : [ next.x, xAxisY ];
                        if (pointInPolygon([ x, y ], [ b2, b1, c1, c2 ])) {
                            sfocus = i;
                        }
                    }
                } else {
                    for (let i = 0; i < l; i++) {
                        if (!ns[i]) continue;
                        const b = cs[i].p;
                        const c = ns[i].p;
                        const func = this.options.smooth ? distToBezierSegmentSquared : distToSegmentSquared;
                        const distance = func(vec, [ b.x, b.y ], [ c.x, c.y ]);
                        if (distance < 100) {
                            sfocus = i;
                        }
                    }
                }

                if (sfocus !== null) {
                    currLegend = curr.series[sfocus].legend;
                }
            }
            if (!segment) {
                globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
                globalCtx.Chart.chartMeta.focused = null;
            } else {
                const belong = segment[segment.belong];
                const meta = {
                    ...belong,
                    currLegend,
                };
                if (JSON.stringify(meta) !== JSON.stringify(globalCtx.Chart.chartMeta.focused)) {
                    globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
                    globalCtx.Chart.chartMeta.focused = meta;
                }
            }
        });
    }

    afterRenderIndicator(ctx, globalCtx) {
        globalCtx.effect(() => {
            const cache = this.overlayerAnimeCache;
            const render = ctx.render.bind(ctx);
            const {
                focused,
            } = globalCtx.Chart.chartMeta;
            cache.spanVertical = globalCtx.Layout.spanVertical;

            if (!focused) {
                cache.x = null;
            } else {
                cache.x = focused.x;
            }
            render();
        });
    }

    renderIndicator(ctx) {
        ctx.addConditionBlockBegin(() => !this.overlayerAnimeCache.x);
        ctx.lineWidth = 2;
        ctx.save();
        ctx.beginPath();
        ctx.functionCallWithDynamicParameter(
            'moveTo', () => this.overlayerAnimeCache.x, 0
        );
        ctx.functionCallWithDynamicParameter(
            'lineTo', () => this.overlayerAnimeCache.x, () => this.overlayerAnimeCache.spanVertical
        );
        ctx.strokeStyle = 'rgb(238, 238, 238)';
        ctx.stroke();
        ctx.restore();
        ctx.addConditionBlockEnd();

        // ctx.functionCallWithLooping(
        //     () => Object.values(cache.activeSeries || {}),
        //     (ctx, loopTarget, { opacity, x }) => {
        //         if(opacity !== 0) {
        //             ctx.save();
        //             ctx.beginPath();
        //             ctx.moveTo(x, 0);
        //             ctx.lineTo(x, cache.spanVertical);
        //             ctx.strokeStyle = `rgba(238, 238, 238,${opacity})`;
        //             ctx.stroke();
        //             ctx.restore();
        //         }
        //     }
        // );
    }

    findDataInSeries(x, seriesMeta) {

        for (let i = 0; i < seriesMeta.length - 1; i++) {
            const x1 = seriesMeta[i].x;
            const x2 = seriesMeta[i + 1].x;

            if (x > x1 && x < x2) {
                return {
                    belong: x - x1 > x2 - x ? 'next' : 'curr',
                    curr: seriesMeta[i],
                    next: seriesMeta[i + 1],
                };
            }
        }
        return null;
    }

    drawInnerLine(data, context) {
        for (let l = 0; l < data.length - 1; l++) {
            const p2 = data[l + 1];
            if (this.options.smooth) {
                const p1 = data[l];
                const points = bezierPoints([ p1.x, p1.y ], [ p2.x, p2.y ]);
                //
                // const span = (p2.x - p1.x)/2
                context.bezierCurveTo(...points);
            } else {
                context.lineTo(p2.x, p2.y);
            }
        }
    }

    drawLineForHitTest(lgname, spanVertical, ctx) {
        ctx.beginPath();
        ctx.rect(0, 0, this.animationContext.series[lgname].clipX, spanVertical);
        ctx.clip();
        ctx.beginPath();
        const data = this.animationContext.series[lgname].points;
        ctx.moveTo(data[0].x, data[0].y);
        this.drawInnerLine(data, ctx);
        ctx.stroke();
        for (let l = 0; l < data.length; l++) {
            const p = data[l];
            this.drawPoint(ctx, p, l);
        }
    }

    drawLine(lgname, theme, spanVertical, ctx, xAxisY) {

        ctx.beginPath();
        ctx.functionCallWithDynamicParameter(
            'rect', 0, 0,
            () => this.animationContext.series[lgname].clipX,
            spanVertical
        );
        ctx.clip();
        const seri = this.animationContext.series[lgname];
        ctx.beginPath();

        ctx.functionsCallWithDynamicParameter(
            () => {
                // let lastData;
                // if (this.options.fill && this.stack) {
                //     let lastlegend;
                //     for (const lg of this.animationContext.legends) {
                //         if (lg.name === lgname) break;
                //         if (!lg.disabled) {
                //             lastlegend = lg.name;
                //         }
                //     }
                //     if (lastlegend) {
                //         lastData = this.animationContext.series[lastlegend].points.slice().reverse();
                //     } else {
                //         lastData = 0;
                //     }
                // }
                // let lastData;
                // if (seri.inStack) {

                // }
                // // console.log(seri.lastStackPoints)
                return {
                    lastData: seri.lastStackPoints.slice().reverse(),
                    data: seri.points,
                    fillColor: colorString.to.rgb([ ...theme.subColor.slice(0, 3), seri.subOpacity ]),
                };
            },
            (ctx, { lastData, data, fillColor }) => {
                ctx.moveTo(data[0].x, data[0].y);
                this.drawInnerLine(data, ctx);
                ctx.stroke();
                if (this.options.fill) {
                    if (lastData.length > 0) {
                        // // console.log(lastData);
                        ctx.lineTo(lastData[0].x, lastData[0].y);
                        this.drawInnerLine(lastData, ctx);
                        ctx.closePath();

                    } else {
                        ctx.lineTo(data[data.length - 1].x, xAxisY);
                        ctx.lineTo(data[0].x, xAxisY);
                        ctx.closePath();
                    }
                    ctx.fillStyle = fillColor;
                    ctx.fill();
                }
                if (data.length < 3000) {
                    for (let l = 0; l < data.length; l++) {
                        const p = data[l];
                        this.drawPoint(ctx, p, l);
                    }
                }
            }
        );
    }

    drawPoint(context, p) {
        const r = this.options.pointRadius;
        // if(this.lineStates.index === idx) {
        //     r *= 1.25
        // }
        context.beginPath();
        context.arc(p.x, p.y, r, 0, Math.PI * 2);
        context.fill();
    }

    render(ctx, globalCtx) {
        const {
            spanVertical,
        } = globalCtx.Layout;
        const seriesInCoord = globalCtx.Chart.chartMeta.seriesInCoord;
        const xAxisY = globalCtx.Coordinate.transformMeta.xAxisY;

        seriesInCoord.forEach(({ legend, theme }, idx) => {
            ctx.addConditionBlockBegin(() =>
                this.animationContext.legends[idx].disabled);
            const lgname = legend.name;
            ctx.save();
            ctx.lineWidth = 1;
            ctx.functionsCallWithDynamicParameter(
                () => colorString.to.rgb([
                    ...theme.color.slice(0, 3),
                    this.animationContext.series[lgname].opacity ]),
                (ctx, color) => {
                    ctx.strokeStyle = ctx.fillStyle = color;
                }
            );
            this.drawLine(lgname, theme, spanVertical, ctx, xAxisY);
            ctx.restore();
            ctx.addConditionBlockEnd();
        });
    }

    afterRender(context2d, globalCtx) {
        // console.log('afterRender');
        const {
            spanHorizontal,
        } = globalCtx.Layout;
        const {
            legend,
        } = globalCtx.globalData.source;
        const render = context2d.render.bind(context2d);
        const animationContext = this.animationContext;
        render.owner = 'linechart';
        globalCtx.effect(() => {
            // console.log('effect linechart anime');
            const {
                spanHorizontal,
            } = globalCtx.Layout;
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;
            const {
                legend,
            } = globalCtx.globalData.source;
            if (animationContext.startEnd) {
                let promise = Promise.resolve();
                if (animationContext.transformAnime) {
                    animationContext.transformAnime.stop();
                    promise = animationContext.transformAnime;
                }
                // 重新出现的线

                promise.then(canceled => {
                    // console.log(canceled);
                    const partner = [];

                    // 避免绘图时 出现legend本地改变了，但是还未进入到这段逻辑，导致闪现的问题
                    this.animationContext.legends = cloneDeep(legend);
                    // console.log(this.animationContext.legends.map(l => l.disabled));
                    seriesInCoord.forEach(({ points, legend, isStack, lastLgDisabled }) => {
                        const disabled = legend.disabled;
                        const seri = this.animationContext.series[legend.name];
                        const renewState = lastLgDisabled && !disabled;
                        // // console.log('renew state', legend.name, seriesInCoord.length, renewState, disabled, lastLgDisabled)
                        if (renewState) {
                            seri.clipX = 0;
                            partner.push({
                                getter: () => 0,
                                setter: v => { seri.clipX = v; },
                                to: spanHorizontal,
                            });
                        } else {
                            partner.push({
                                getter: () => seri.clipX,
                                setter: v => { seri.clipX = v; },
                                to: spanHorizontal,
                            });
                        }
                        points.forEach((p, i) => {
                            if (renewState) {
                                seri.points[i] = clone(p);
                            } else {
                                partner.push({
                                    getter: () => seri.points[i].x,
                                    setter: v => { seri.points[i].x = v; },
                                    to: p.x,
                                });
                                partner.push({
                                    getter: () => seri.points[i].y,
                                    setter: v => { seri.points[i].y = v; },
                                    to: p.y,
                                });
                                if (isStack) {
                                    // // console.log(seri.lastStackPoints)
                                    partner.push({
                                        getter: () => seri.lastStackPoints[i].x,
                                        setter: v => { seri.lastStackPoints[i].x = v; },
                                        to: p.x,
                                    });
                                    partner.push({
                                        getter: () => seri.lastStackPoints[i].y,
                                        setter: v => { seri.lastStackPoints[i].y = v; },
                                        to: p.lastY,
                                    });
                                }

                            }
                        });
                    });
                    animationContext.transformAnime = animate({
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

        globalCtx.effect(() => {
            const legendFocusIdx = globalCtx.Overlayer.overLayerMeta.focus;
            if (legendFocusIdx !== undefined) {
                const legend = globalCtx.globalData.source.legend;
                globalCtx.Chart.chartMeta.focused = {
                    currLegend: legend[legendFocusIdx],
                };
            } else {
                globalCtx.Chart.chartMeta.focused = null;
            }

        });

        /**
            focus legend
         */
        globalCtx.effect(() => {
            const focused = globalCtx.Chart.chartMeta.focused;
            const {
                legend,
                data,
            } = globalCtx.globalData.source;

            if (!focused || legend.length === 1 || data.length > 3000) {
                return;
            }
            if (animationContext.focusedLegendOpacity) {
                animationContext.focusedLegendOpacity.stop();
            }
            const series = this.animationContext.series;
            if (focused.currLegend) {
                const currname = focused.currLegend.name;
                const partner = [];
                legend.forEach(l => {
                    partner.push({
                        getter: () => series[l.name].opacity,
                        setter: v => { series[l.name].opacity = v; },
                        to: l.name === currname ? 1 : 0.4,
                    });
                    partner.push({
                        getter: () => series[l.name].subOpacity,
                        setter: v => { series[l.name].subOpacity = v; },
                        to: l.name === currname ? 0.4 : 0.1,
                    });
                });
                animationContext.focusedLegendOpacity = animate({
                    partner,
                    animation: {
                        duration: 250,
                        easing: 'easeInQuad',
                    },
                    render,
                });

            } else {
                const partner = [];
                legend.forEach(l => {
                    partner.push({
                        getter: () => series[l.name].opacity,
                        setter: v => { series[l.name].opacity = v; },
                        to: 1,
                    });
                    partner.push({
                        getter: () => series[l.name].subOpacity,
                        setter: v => { series[l.name].subOpacity = v; },
                        to: 0.4,
                    });
                });
                animationContext.focusedLegendOpacity = animate({
                    partner,
                    animation: {
                        duration: 250,
                        easing: 'easeInQuad',
                    },
                    render,
                });
            }

        });

        if (!this.animationContext.startEnd) {
            if (animationContext.startEnd) {
                animationContext.startEnd.stop();
            }
            this.animationContext.startEnd = animate(
                {
                    partner: legend.map(l => ({
                        getter: () => animationContext.series[l.name].clipX,
                        setter: v => { animationContext.series[l.name].clipX = v; },
                        to: spanHorizontal,
                    })),
                    animation: {
                        duration: 1000,
                        easing: 'easeInQuad',
                    },
                    render,
                });
        }
    }
}

export default LineChart;


// this.createGradient = () => {
//     const grd = context.createLinearGradient(0, 0, 0, maxY);
//     grd.addColorStop(0, startColor);
//     grd.addColorStop(1, endColor);
// }
// this.fillArea = (series, context, startColor, endColor, lastSeries) => {
//     const grd = context.createLinearGradient(0, 0, 0, maxY);
//     grd.addColorStop(0, startColor);
//     grd.addColorStop(1, endColor);

//     context.fillStyle = grd;
//     context.strokeStyle = 'transparent';
//     if(this.stack) {
//         context.beginPath();
//         context.moveTo(series[0].x, series[0].y);
//         this.drawInnerLine(series, context);
//         if(lastSeries) {
//             const lastIndex = lastSeries.length - 1;
//             context.lineTo(lastSeries[lastIndex].x, lastSeries[lastIndex].y);
//             this.drawInnerLine(lastSeries.slice().reverse(), context);
//             context.closePath()
//             // context.clip();
//         } else {
//             context.lineTo(spanHorizontal - xFloat, 0);
//             context.lineTo(xFloat, 0);
//         }

//         context.fill();
//     }else {
//         context.beginPath();
//         context.moveTo(series[0].x, series[0].y);
//         this.drawInnerLine(series, context);
//         context.lineTo(spanHorizontal - xFloat, 0);
//         context.lineTo(xFloat, 0);
//         context.fill();
//     }


//     context.strokeStyle = endColor;
//     context.fillStyle = endColor;
//     this.drawLine(series, context)
// }
