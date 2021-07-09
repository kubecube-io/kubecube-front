import {
    vec2
} from 'gl-matrix';
import {
    REFERENCE_TYPE,
} from '../../shared/utils';
import { sum } from 'lodash';
import { animate } from '../../animation/Animate';
import colorString from 'color-string';
import { effect } from '@vue/reactivity';

class BarChart {
    constructor(options = {}) {
        this.name = "BarChart";
        this.options = Object.assign({ barmargin: 6 }, options);
        this.x_scaler = 0;
        this.stack = false;
        this.animationContext = {
            series: [],
            legendStyle: {},
            activeSeries: [],
        };
        this.lastLegendState = undefined;
        this.overlayerAnimeCache = {};
    }

    apply(globalCtx) {
        globalCtx.Chart.hooks.initChart.tap(this.name, () => {
            this.init(globalCtx);
        });
        globalCtx.Chart.hooks.renderChart.tap(this.name, (context2d) => {
            this.render(context2d, globalCtx);
        });
        globalCtx.Chart.hooks.afterRenderChart.tap(this.name, (context2d) => {
            this.afterRender(context2d, globalCtx);
        });

        globalCtx.Overlayer.hooks.renderOverLayer.tap(this.name, (ctx) => {
            this.renderIndicator(ctx);
        });
        globalCtx.Overlayer.hooks.afterRenderChart.tap(this.name, (ctx) => {
            this.afterRenderIndicator(ctx, globalCtx);
        });
    }

    init(globalCtx) {
        const barmargin = this.options.barmargin;
        const seriesMargin = 10;
        globalCtx.effect(() => {
            const seriesTheme = globalCtx.theme.series;
            const {
                data: series,
                reference,
                legend,
                stack
            } = globalCtx.globalData.source;
            const lastLegendState = this.lastLegendState;
            const {
                x_scaler,
                convertDataToCoordX,
                convertDataToCoordY,
                xAxisY,
            } = globalCtx.Coordinate.transformMeta;
            const legendOnNum = legend.filter(l => !l.disabled).length;
            const barnum = legend.length;
            const spaninMargin = x_scaler - seriesMargin*2;
            const span = spaninMargin - (stack ? 0 : Math.max(0, barnum - 1) * barmargin);
            const perSpan = stack ? span : span / barnum;
            const px = stack ? 0 : (spaninMargin - perSpan * legendOnNum)/2;
            const seriesInCoord = [];
            const seriesMeta = [];
            this.stack = stack;
            let xspan = 0;
            // const px = spanAble - span + perSpan * legendOffNum/2;

            legend.forEach((d, sid) => {
                // if(d.disabled) return;
                let seri;
                if(this.stack){
                    seri = series[0];
                } else {
                    seri = series[sid];
                }
                const lgdisabled = d.disabled;
                const lastLgDisabled = !!lastLegendState && lastLegendState[sid];
                xspan += lgdisabled ? 0 : perSpan+barmargin;
                const theme = seriesTheme.get(sid);
                this.animationContext.legendStyle[d.name] = 1;
                //    // console.log(seri)
                seriesInCoord.push({
                    legend: d,
                    lastLgDisabled,
                    theme,
                    points: seri.map((v, idx) => {
                        let dx = v[0];
                        let dy;
                        let dyraw;
                        let startY = xAxisY;
                        if(stack) {
                            dyraw = v[sid+1];
                            dy = v[sid+1];

                            startY = convertDataToCoordY(sum(v.slice(1, sid+1).filter((a,idx) => !legend[idx].disabled)));
                        } else {
                            dy = dyraw = v[1];
                        }

                        let ref;
                        if(reference.type === REFERENCE_TYPE.discrete){
                            ref = idx;
                        }
                        if(reference.type === REFERENCE_TYPE.continuous){
                            ref = dx;
                        }

                        const x = convertDataToCoordX(ref);
                        const y = convertDataToCoordY(dy);

                        // const height = y - xAxisY;
                        const p = {
                            x: x + px + seriesMargin + (stack ? 0 : Math.max(0, xspan-perSpan - barmargin)),// (stack ? 0 : sid * perSpan),
                            y: lgdisabled ? 0 : y - xAxisY,
                            startY,
                            perSpan: perSpan,
                        };
                        // // console.log(p)
                        if(!seriesMeta[idx]) {
                            seriesMeta[idx] = {
                                startX: x,
                                endX: x + x_scaler,
                                spanX: x_scaler,
                                series: [],
                                curSeq: idx,
                            };
                        }
                        if(!this.animationContext.series[idx]) {
                            if(!this.animationContext.series[idx]) {
                                this.animationContext.series[idx] = {
                                    focusBGOpacity: 0,
                                };
                            }
                        }
                        if(!this.animationContext.series[idx] || !this.animationContext.series[idx][d.name]) {
                            Object.assign(this.animationContext.series[idx], {
                                [d.name]: {
                                    x: p.x,
                                    y: 0,
                                    startY: startY,
                                    span: perSpan }
                            });
                        }
                        seriesMeta[idx].series.push({ legend: d, p, dx, dy: dyraw, theme });
                        return p;
                    })
                });
            });

            this.lastLegendState = legend.map(l => l.disabled);
            this.x_scaler = x_scaler;
            Object.assign(globalCtx.Chart.chartMeta, {
                seriesInCoord,
                seriesMeta,
            });
            this.perSpan = perSpan;
        });

        effect(() => {
            // hover 态
            // 避免主图多次重绘
            const legendFocusIdx = globalCtx.Overlayer.overLayerMeta.focus;
            if(legendFocusIdx !== undefined) return;
            const {
                seriesMeta,
            } = globalCtx.Chart.chartMeta;
            const {
                spanHorizontal,
                spanVertical,
            } = globalCtx.Layout;
            const {x, y, event} = globalCtx._mouse;
            const {
                transformMtxRawInvert,
            } = globalCtx.Coordinate.transformMeta;
            const vec = vec2.fromValues(x, y);
            vec2.transformMat2d(vec, vec, transformMtxRawInvert);
            const xloc = vec[0];
            const yloc = vec[1];
            // vec2.subtract(vec, vec, originVec);
            if(xloc < 0 || xloc > spanHorizontal || yloc < 0 || yloc > spanVertical) {
                globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
                globalCtx.Chart.chartMeta.focused = null;
                return;
            }
            const meta = this.findDataInSeries(xloc, yloc, seriesMeta);

            if(!meta || event === 'mouseleave') {
                globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
                globalCtx.Chart.chartMeta.focused = null;
            } else {
                if(JSON.stringify(meta) != JSON.stringify(globalCtx.Chart.chartMeta.focused)){
                    globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
                    globalCtx.Chart.chartMeta.focused = meta;
                }
            }
        });
    }

    afterRenderIndicator(ctx, globalCtx) {
        // console.log('rerender');
        globalCtx.effect(() => {
            const cache = this.overlayerAnimeCache;
            const render = ctx.render.bind(ctx);
            if(!cache.activeSeries){
                cache.activeSeries = {};
            }
            const {
                focused,
                lastFocused
            }  = globalCtx.Chart.chartMeta;
            const {
                spanVertical,
            } = globalCtx.Layout;
            cache.spanVertical = spanVertical;
            const anime = (toFunc) => {
                let promise = Promise.resolve();
                if(cache.focusTranslateAnime){
                    cache.focusTranslateAnime.stop();
                    promise = cache.focusTranslateAnime;
                }
                promise.then(() => {
                    const partner = [];
                    for(let x in cache.activeSeries) {
                        const curr = cache.activeSeries[x];
                        const toval = toFunc(curr.x);
                        if(toval !== curr.opacity){
                            partner.push({
                                getter: () => curr.opacity,
                                setter: (v) => { curr.opacity = v; },
                                to: toval,
                            });
                        }
                    }

                    cache.focusTranslateAnime = animate({
                        partner,
                        animation: {
                            duration: 150,
                            easing: 'easeInQuad',
                        },
                        render
                    });
                });
            };

            if(!focused) {
                anime(() => 0);
                return;
            }
            const currx = focused.startX;

            if((!lastFocused || lastFocused.startX !== currx) && currx !== undefined) {
                if(!cache.activeSeries[currx]){
                    cache.activeSeries[currx] = {
                        opacity: 0,
                        x: currx,
                        spanX: focused.spanX,
                    };
                }
                anime(x => currx === x ? 0.3 : 0);

            }
        });


    }

    renderIndicator(ctx) {
        const cache = this.overlayerAnimeCache;
        ctx.functionCallWithLooping(
            () => Object.values(cache.activeSeries || {}),
            (ctx, loopTarget, { opacity, x, spanX }) => {
                if(opacity !== 0) {
                    ctx.save();
                    ctx.fillStyle = `rgba(238, 238, 238,${opacity})`;
                    ctx.fillRect(x, 0, spanX, cache.spanVertical);
                    ctx.restore();
                }
            }
        );
    }

    findDataInSeries(x, y, seriesMeta) {
        for(let i = 0; i < seriesMeta.length; i++) {
            const currMeta = seriesMeta[i];
            const x1 = currMeta.startX;
            const x2 = currMeta.endX;

            if(x > x1 && x < x2) {
                const series = currMeta.series;
                let currLegend;
                for(let j = 0; j < series.length; j++) {
                    const x1 = series[j].p.x;

                    const ys = series[j].p.startY;
                    const y1 = series[j].p.y + ys;
                    const x2 = x1 + series[j].p.perSpan;
                    if(x > x1 && x < x2 && y < y1 && y > ys) {
                        currLegend = series[j].legend;
                        break;
                    }
                }
                return {
                    ...currMeta,
                    currLegend,
                };
            }
        }
        return null;
    }

    render(ctx, globalCtx) {
        const {
            seriesInCoord,
        } = globalCtx.Chart.chartMeta;
        let lastLegend = null;
        seriesInCoord.forEach(({ points, theme, legend }) => {
            ctx.save();
            if(!lastLegend || lastLegend.name !== legend.name || points.length <= 3000) {
                ctx.propertySetWithDynamicParameter('fillStyle', () => {
                    const opcity = this.animationContext.legendStyle[legend.name];
                    return colorString.to.rgb([...theme.color.slice(0,3), opcity]);
                });
                lastLegend = legend;
            }
            ctx.beginPath();
            const name = legend.name;
            const data = points;
            ctx.addConditionBlockBegin(() => legend.disabled);
            for(let i=0; i < data.length; i++) {
                ctx.save();
                ctx.functionCallWithDynamicParameter(
                    'fillRect',
                    () => this.animationContext.series[i][name].x,
                    () => this.animationContext.series[i][name].startY + 1,
                    // 1 + p.startY,
                    () => this.animationContext.series[i][name].span,
                    () => this.animationContext.series[i][name].y - 1);
                ctx.restore();
            }
            ctx.addConditionBlockEnd();
            ctx.restore();
        });
    }

    afterRender(context2d, globalCtx) {
        const animationContext = this.animationContext;
        const render = context2d.render.bind(context2d);
        const {
            seriesInCoord,
        } = globalCtx.Chart.chartMeta;
        // 切换
        globalCtx.effect(() => {
            // console.log('afterRender');
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;

            if(animationContext.startEnd) {
                let promise = Promise.resolve();
                if(animationContext.transformAnime){
                    animationContext.transformAnime.stop();
                    promise = animationContext.transformAnime;
                }
                promise.then((canceled) => {
                    // console.log(canceled);
                    const partner = [];
                    seriesInCoord.forEach(({ points, legend }) => {
                        const name = legend.name;
                        // const disabled = legend.disabled;
                        // const renewState = lastLgDisabled && !disabled;
                        points.forEach((p, i) => {
                            const seri = this.animationContext.series[i][name];
                            // if(renewState) {
                            //     seri.y = 0;
                            //     seri.x = p.x;
                            //     seri.startY = p.startY;
                            //     seri.span = p.perSpan;
                            //     partner.push({
                            //         getter: () => seri.y,
                            //         setter: (v) => { seri.y = v; },
                            //         to: p.y,
                            //         delay: 350,
                            //     });
                            // } else {
                            partner.push({
                                getter: () => seri.y,
                                setter: (v) => { seri.y = v; },
                                to: p.y,
                            });
                            partner.push({
                                getter: () => seri.x,
                                setter: (v) => { seri.x = v; },
                                to: p.x,
                            });
                            partner.push({
                                getter: () => seri.span,
                                setter: (v) => { seri.span = v; },
                                to: p.perSpan,
                            });
                            partner.push({
                                getter: () => seri.startY,
                                setter: (v) => { seri.startY = v; },
                                to: p.startY,
                            });
                            // }

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

        // 单条指示
        globalCtx.effect(() => {
            const legendFocusIdx = globalCtx.Overlayer.overLayerMeta.focus;
            if(legendFocusIdx !== undefined) {
                const legend = globalCtx.globalData.source.legend;
                globalCtx.Chart.chartMeta.focused = {
                    currLegend: legend[legendFocusIdx],
                };
            } else {
                globalCtx.Chart.chartMeta.focused = {
                    currLegend: undefined
                };
            }
        });

        globalCtx.effect(() => {
            // console.log('focused bar chart');

            const focused = globalCtx.Chart.chartMeta.focused;
            const {
                data,
                legend,
            } = globalCtx.globalData.source;
            // 数据大于 3000 或 只有一个legend 取消动画效果
            if(legend === 1 || data.length > 3000) return;
            if(!focused) {
                if(animationContext.focusedLegendOpacity){
                    animationContext.focusedLegendOpacity.stop();
                }
                animationContext.focusedLegendOpacity = animate({
                    partner: legend.map((l) => ({
                        getter: () => this.animationContext.legendStyle[l.name],
                        setter: (v) => { this.animationContext.legendStyle[l.name] = v; },
                        to: 1,
                    })),
                    animation: {
                        duration: 250,
                        easing: 'easeInQuad',
                    },
                    render,
                });
                return;
            }
            if(animationContext.focusedLegendOpacity){
                animationContext.focusedLegendOpacity.stop();
            }
            if(focused.currLegend) {
                const currname = focused.currLegend.name;
                animationContext.focusedLegendOpacity = animate({
                    partner: legend.map((l) => ({
                        getter: () => this.animationContext.legendStyle[l.name],
                        setter: (v) => { this.animationContext.legendStyle[l.name] = v; },
                        to: l.name === currname ? 1 : 0.6,
                    })),
                    animation: {
                        duration: 250,
                        easing: 'easeInQuad',
                    },
                    render,
                });

            } else {
                animationContext.focusedLegendOpacity = animate({
                    partner: legend.map((l) => ({
                        getter: () => this.animationContext.legendStyle[l.name],
                        setter: (v) => { this.animationContext.legendStyle[l.name] = v; },
                        to: 1,
                    })),
                    animation: {
                        duration: 250,
                        easing: 'easeInQuad',
                    },
                    render,
                });
            }
        });



        if(!animationContext.startEnd) {
            if(animationContext.startEnd){
                animationContext.startEnd.stop();
            }
            animationContext.startEnd = animate({
                partner: seriesInCoord.reduce((accu, { points, legend }) => {
                    const name = legend.name;
                    return accu.concat(points.map((p, i) => ({
                        getter: () => this.animationContext.series[i][name].y,
                        setter: (v) => { this.animationContext.series[i][name].y = v; },
                        to: p.y,
                    })));
                }, []),
                animation: {
                    duration: 550,
                    easing: 'easeInQuad',
                },
                render,
            });
        }
    }
}

export default BarChart;
