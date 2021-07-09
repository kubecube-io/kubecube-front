// import { debounce } from 'lodash';
import colorString from 'color-string';
import { effect } from '@vue/reactivity';

// const floatContent = function(element, series, formatFunc) {
//     const lis = series.filter(s => !s.legend.disabled).sort((a, b) => b.dy - a.dy).map(({ legend, dy, theme }) => `<li><span style="list-style: none;display:inline-block;width:.8em;height:.8em;border-radius:100%;background:${colorString.to.rgb(theme.color)};margin-right:.5em"></span>${legend.name}: ${dy}</li>`)
//         .join('');
//     const dx = formatFunc.xFormat(series[0].dx);
//     element.innerHTML = `<div><h5>${dx}</h5><ul style="list-style: none;margin: 0;padding:0">${lis}</ul></div>`;
// };
class CrossIndicator {
    constructor(options) {
        this.name = 'CrossIndicator';
        this.options = Object.assign({
            vertical: false,
            horizontal: true,
            lineStyle: ctx => {
                ctx.setLineDash([ 4, 2 ]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#ccc';
            },
            callback: () => {},
            // floatContent,
        }, options);

        // const floatElement = document.createElement('div');
        // floatElement.style.position = 'absolute';
        // floatElement.style.left = '0';
        // floatElement.style.top = '0';
        // floatElement.style.background = '#fff';
        // floatElement.style.border = '1px solid #ddd';
        // floatElement.style.display = 'none';
        // floatElement.style.padding = '10px';
        // floatElement.style.transition = 'all .5s .2s'
        // this.floatElement = floatElement;

        // this.animationContext = {};
    }

    apply(globalCtx) {
        globalCtx.Overlayer.hooks.initOverlayer.tap(this.name, container => {
            this.init(container, globalCtx);
        });
    }

    // renderElem(x, y, focused, formatFunc) {
    //     this.floatElement.style.display = 'block';
    //     this.floatElement.style.transform = `translate(${x + 20}px, ${y + 20}px)`;
    //     this.options.floatContent(this.floatElement, focused.series, formatFunc);
    // }

    init(container, globalCtx) {
        // container.appendChild(this.floatElement);
        // const hideFunc = debounce(() => {
        //     this.floatElement.style.display = 'none';
        // }, 250);
        effect(() => {
            const callback = this.options.callback;
            const legendFocusIdx = globalCtx.Overlayer.overLayerMeta.focus;
            const focused = globalCtx.Chart.chartMeta.focused;
            if (!focused || legendFocusIdx !== undefined) {
                // hideFunc();
                callback({
                    display: false,
                });
                return;
            }
            const {
                xMeta,
                yMeta,
            } = globalCtx.globalData.sourceMeta;
            // const formatFunc = globalCtx.Coordinate.transformMeta.formatFunc;
            const { x, y } = globalCtx._mouse;
            const {
                left, top, bottom, spanHorizontal,
            } = globalCtx.Layout;
            if (x < left + spanHorizontal && x > left && y > top && y < bottom) {
                // this.renderElem(x, y, focused, formatFunc);
                callback({
                    display: true,
                    x, y,
                    xDimension: xMeta.formatter(focused.series[0].dx),
                    series: focused.series.filter(s => !s.legend.disabled)
                        .map(({ legend, dy, theme }) => ({
                            name: legend.name,
                            color: colorString.to.rgb(theme.color),
                            data: yMeta.formatter(dy),
                            rawData: dy,
                        })),
                });
            } else {
                // hideFunc();
                callback({
                    display: false,
                });
            }


        });
    }
}

export default CrossIndicator;
