import {
    mat2d, vec2
} from 'gl-matrix';
import {
    decodeStringValues
} from '../../shared/utils';
import { animate } from '../../animation/Animate';
import colorString from 'color-string';
import { effect } from '@vue/reactivity';
class PieChart {
    constructor(options = {}) {
        this.name = "PieChart";
        this.options = options;
        this.transformMtx = mat2d.create();
        this.transformMtxInvert = mat2d.create();
        this.center = vec2.create();
        this.radius = 200;
        this.animationContext = {
            arcs: [],
        };
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
    }

    init(globalCtx) {
        globalCtx.effect(() => {
            // console.log('pie chart effect');
            const seriesTheme = globalCtx.theme.series;
            const {
                data: series,
                legend,
            } = globalCtx.globalData.source;
            const {
                translateMtx,
                spanHorizontal: layoutsh,
                spanVertical: layoutsv,
            } = globalCtx.Layout;
            const DPIMat = globalCtx.DPIMat;
            const {
                position,
            } = this.options;
            const { x, y } = position;
            mat2d.multiply(this.transformMtx, DPIMat, translateMtx);
            mat2d.invert(this.transformMtxInvert, translateMtx);

            // // console.log(x, y)
            const center = vec2.fromValues(
                decodeStringValues(x)(layoutsh),
                decodeStringValues(y)(layoutsv),
            );
            this.radius = decodeStringValues(this.options.radius)(Math.min(layoutsh, layoutsv)),
            vec2.transformMat2d(this.center, center, translateMtx);
            const seriesInCoord = [];
            const legendXInCoord = {};
            // const seriesAnimation = [];
            let accu = 0;
            let sumup = 0;
            let length = 0;
            legend.forEach((l, idx) => {
                if(!l.disabled) {
                    sumup += series[idx][0][1];
                    length++;
                }
            });
            let length2 = 0;
            legend.forEach((l, idx) => {
                if(!l.disabled) {
                    const dy =  series[idx][0][1];
                    const ratio = dy / sumup;
                    let spanRadius = ratio * Math.PI * 2;
                    if(length2 === length) {
                        spanRadius = Math.PI * 2 - accu;
                    }
                    const p =  {
                        startAngle: accu,
                        middleAngle: accu + spanRadius / 2,
                        endAngle: accu + spanRadius,
                    };
                    seriesInCoord.push({
                        theme: seriesTheme[idx],
                        points: [ p ],
                        radius: this.radius,
                        legend: l,
                    });
                    legendXInCoord[idx] = [{
                        p,
                        sid: idx,
                        dx: l,
                        dy,
                    }];
                    if(!this.animationContext.startEnd) {
                        this.animationContext.arcs[idx] = {
                            ...p,
                            radius: this.radius
                        };
                    }

                    accu += spanRadius;
                    length2++;
                } else {
                    seriesInCoord.push({
                        theme: seriesTheme[idx],
                        points: [{
                            startAngle: accu,
                            middleAngle: accu,
                            endAngle: accu,
                        }],
                        radius: 0,
                        legend: l,
                    });
                }
            });

            Object.assign(globalCtx.Chart.chartMeta, {
                seriesInCoord,
                legendXInCoord,
            });

            if(!this.animationContext.startEnd) {
                this.animationContext.startSpin = 0.1;
                this.animationContext.startEnd = false;
            }

        });

        effect(() => {
            // // console.log('chart mouse effect')
            // 避免主图多次重绘
            const legendFocusIdx = globalCtx.Overlayer.overLayerMeta.focus;
            if(legendFocusIdx !== undefined) return;
            const {
                seriesInCoord,
                focusSource,
            } = globalCtx.Chart.chartMeta;
            const {x, y} = globalCtx._mouse;
            if(x === undefined || y === undefined) {
                return;
            }
            const vec = vec2.fromValues(x, y);
            const center = this.center;
            const radius = this.radius;
            // 鼠标位置变换到当前坐标系下
            vec2.transformMat2d(vec, vec, this.transformMtxInvert);
            // 关于左上角做变换
            // vec2.subtract(vec, originVec, vec);
            vec2.subtract(vec, vec, center);
            const x1 = vec[0];
            const y1 = vec[1];
            const dist = Math.hypot(x1, y1);
            if(focusSource === 'legend') return;
            if(dist > radius) {
                // globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
                globalCtx.Chart.chartMeta.focused = undefined;
                return;
            }
            const x2 = 0;
            const y2 = 1;
            const dot = x1*x2 + y1*y2;
            const det = x1*y2 - y1*x2;

            let angle = Math.atan2(dot, det);
            if(angle < 0) {
                angle = Math.PI*2 + angle;
            }
            const idx = seriesInCoord.findIndex((s) => {
                const { startAngle, endAngle } = s.points[0];
                return angle > startAngle && angle < endAngle;
            });
            globalCtx.Chart.chartMeta.lastFocused = globalCtx.Chart.chartMeta.focused;
            globalCtx.Chart.chartMeta.focused = idx;

        });
    }

    setTransform(ctx) {
        const mtx = this.transformMtx;
        ctx.setTransform(mtx[0],mtx[1],mtx[2],mtx[3],mtx[4],mtx[5]);
    }

    render(ctx, globalCtx) {
        // console.log('pie chart render');
        // const seriesTheme = globalCtx.theme.series;
        const {
            seriesInCoord,
        } = globalCtx.Chart.chartMeta;
        // // console.log(seriesInCoord);
        const {
            fontSize
        } = globalCtx.fontInWrapper;
        const center = this.center;
        const radius = this.radius;
        const textRadius = radius + 20;
        const x = center[0];
        const y = center[1];
        ctx.save();
        this.setTransform(ctx);
        ctx.font = `${fontSize}px arial`;
        ctx.addConditionBlockBegin(() => {
            return this.animationContext.startEnd;
        });
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.functionCallWithDynamicParameter(
            'arc', x, y, textRadius,
            () => this.animationContext.startSpin,
            0,
            true
        );
        ctx.clip();
        ctx.addConditionBlockEnd();

        seriesInCoord.forEach(({points, theme, legend}, idx) => {
            const s = points[0];
            const currArc = this.animationContext.arcs[idx];
            ctx.addConditionBlockBegin(() => {
                return currArc.startAngle === currArc.endAngle;
            });
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = colorString.to.rgb(theme.color);
            ctx.strokeStyle = colorString.to.rgb(theme.color);
            ctx.moveTo(x, y);
            ctx.functionCallWithDynamicParameter(
                'arc', x, y,
                () => currArc.radius || radius,
                () => currArc.startAngle || s.startAngle,
                () => currArc.endAngle || s.endAngle,
            );
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x, y);

            ctx.functionsCallWithDynamicParameter(
                () => {
                    const middleAngle = currArc.middleAngle;
                    const sinr = Math.sin(middleAngle);
                    const cosr = Math.cos(middleAngle);
                    const textx = x + textRadius * cosr;
                    const texty = y + textRadius * sinr;
                    const dir = cosr / Math.abs(cosr);
                    const textsx = textx + dir * 20;
                    return {textx, texty, dir, textsx};
                },
                (ctx, inputs) => {
                    const {textx, texty, dir, textsx} = inputs;
                    ctx.lineTo(textx, texty);
                    ctx.lineTo(textsx, texty);

                    ctx.stroke();
                    ctx.restore();

                    ctx.textAlign = dir > 0 ? 'left' : 'right';

                    ctx.fillText(`${legend.name}`,
                        textsx + dir * 10,
                        texty + fontSize/2);
                }
            );
            ctx.addConditionBlockEnd();
        });


        ctx.restore();
    }

    afterRender(context2d, globalCtx) {
        const {
            seriesInCoord,
        } = globalCtx.Chart.chartMeta;
        const length = seriesInCoord.length;
        const radius = this.radius;
        const animationContext = this.animationContext;
        const render = context2d.render.bind(context2d);

        function animateTo(i, to) {
            const currArc = animationContext.arcs[i];
            let promise = Promise.resolve();

            if(currArc.animeOnRadius){
                currArc.animeOnRadius.stop();
                promise = currArc.animeOnRadius;
            }
            promise.then(() => {
                currArc.animeOnRadius = animate(
                    {
                        partner: [
                            {
                                getter: () => currArc.radius,
                                setter: (v) => { currArc.radius = v; },
                                to,
                            }
                        ],
                        animation: {
                            duration: 400,
                            easing: 'easeInQuad',
                        },
                        render,
                    });
            });
        }

        globalCtx.effect(() => {
            // 聚焦时的短动画
            const {
                focused,
                lastFocused,
            } = globalCtx.Chart.chartMeta;
            if(focused !== undefined) {
                for(let i=0;i<length;i++){
                    animateTo(i, focused === i ? radius + 10 : radius);
                }
            } else if(lastFocused!==undefined){
                for(let i=0;i<length;i++){
                    if(i === lastFocused) {
                        animateTo(i, radius);
                        return;
                    }
                }
            }
        });
        // 针对legend的变换
        globalCtx.effect(() => {
            const legendFocusIdx = globalCtx.Overlayer.overLayerMeta.focus;
            // console.log(legendFocusIdx);
            if(legendFocusIdx !== undefined) {
                globalCtx.Chart.chartMeta.focused = legendFocusIdx;
            } else {
                globalCtx.Chart.chartMeta.focused = undefined;
                for(let i=0;i<length;i++){
                    animateTo(i, radius);
                }
            }

        });
        globalCtx.effect(() => {
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;
            if(animationContext.startEnd) {
                // console.log('legend变换单独');
                // legend变换单独
                let promise = Promise.resolve();
                if(animationContext.transformAnime){
                    animationContext.transformAnime.stop();
                    promise = animationContext.transformAnime;
                }
                promise.then(() => {
                    const partner = [];
                    seriesInCoord.forEach((s, idx) => {
                        const { startAngle, endAngle, middleAngle } = s.points[0];
                        const currArc = animationContext.arcs[idx];
                        partner.push({
                            getter: () => currArc.startAngle,
                            setter: (v) => { currArc.startAngle = v; },
                            to: startAngle,
                        });
                        partner.push({
                            getter: () => currArc.middleAngle,
                            setter: (v) => { currArc.middleAngle = v; },
                            to: middleAngle,
                        });
                        partner.push({
                            getter: () => currArc.endAngle,
                            setter: (v) => { currArc.endAngle = v; },
                            to: endAngle,
                        });
                    });
                    animationContext.transformAnime = animate(
                        {
                            partner,
                            animation: {
                                duration: 1000,
                                easing: 'easeInQuad',
                            },
                            render,
                        });
                });
            }
        });


        if(!animationContext.startEnd) {
            // 开始的变换
            if(animationContext.spinAnime){
                animationContext.spinAnime.stop();
            }
            animationContext.spinAnime = animate(
                {
                    partner: [
                        {
                            getter: () => animationContext.startSpin,
                            setter: (v) => { animationContext.startSpin = v; },
                            to: Math.PI*2,
                        }
                    ],
                    animation: {
                        duration: 1000,
                        easing: 'easeInQuad',
                    },
                    render,
                });
            animationContext.spinAnime.then((canceled) => {
                if(!canceled) {
                    animationContext.startEnd = true;
                    render();
                }
            });
        } else {
            // // console.log('xxx')
        }

    }
}

export default PieChart;
