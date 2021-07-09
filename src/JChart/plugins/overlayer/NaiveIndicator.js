import { reactive } from '@vue/reactivity';
import { clone, debounce } from 'lodash';
import colorString from 'color-string';
import { effect } from '@vue/reactivity';

const floatContent = function(element, data, legend, theme) {
    const lis = `<li><span style="list-style: none;display:inline-block;width:.8em;height:.8em;border-radius:100%;background:${colorString.to.rgb(theme.color)};margin-right:.5em"></span>${legend}: ${data}</li>`;
    element.innerHTML = `<ul style="list-style: none;margin: 0;padding:0">${lis}</ul></div>`;
};
class NaiveIndicator {
    constructor(options = {}) {
        this.name = 'NaiveIndicator';
        this.options = Object.assign({
            floatContent,
        }, options);

        this.indicator = reactive({
            xPoint: null,
        });

        const floatElement = document.createElement('div');
        floatElement.style.position = 'absolute';
        floatElement.style.left = '0';
        floatElement.style.top = '0';
        floatElement.style.background = '#fff';
        floatElement.style.border = '1px solid #ddd';
        floatElement.style.display = 'none';
        floatElement.style.padding = '10px';
        // floatElement.style.transition = 'all .5s .2s'
        this.floatElement = floatElement;
    }

    apply(globalCtx) {
        globalCtx.Overlayer.hooks.initOverlayer.tap(this.name, (container) => {
            this.init(container, globalCtx);
        });
    }


    renderElem(x, y, data, legend, theme) {
        this.floatElement.style.display = 'block';
        this.floatElement.style.transform = `translate(${x + 20}px, ${y + 20}px)`;
        this.options.floatContent(this.floatElement, data, legend, theme);
    }

    init(container, globalCtx){
        container.appendChild(this.floatElement);
        const hideFunc = debounce(() => {
            this.floatElement.style.display = 'none';
        }, 250);
        effect(() => {
            // // console.log('NaiveIndicator effect')
            const { x, y } = globalCtx._mouse;
            const {
                focused
            } = globalCtx.Chart.chartMeta;

            const {
                data, legend
            } = globalCtx.globalData.source;
            if(focused === undefined || !data[focused] || !legend[focused]) {
                hideFunc();
                return;
            }
            const seriesTheme = globalCtx.theme.series;
            this.renderElem(x, y,
                clone(data[focused][0][1]),
                clone(legend[focused].name),
                clone(seriesTheme[focused]));
        });
    }

}

export default NaiveIndicator;
