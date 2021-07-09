import colorString from 'color-string';

class LegendPlugin {
    constructor(options) {
        this.name = 'LegendPlugin';
        this.options = Object.assign({
            style: 'position: absolute;left: 10px; top: 10px;',
        }, options);

        this.container = document.createElement('div');
        this.container.setAttribute('style', this.options.style);
    }

    apply(globalCtx) {
        globalCtx.Overlayer.hooks.initOverlayer.tap(this.name, container => {
            this.init(container, globalCtx);
        });
    }

    init(container, globalCtx) {
        globalCtx.effect(() => {
            this.container.innerHTML = '';
            const {
                legend,
            } = globalCtx.globalData.source;
            const seriesTheme = globalCtx.theme.series;
            const legendMeta = legend.map((l, idx) => ({
                legend: l,
                color: {
                    enable: colorString.to.rgb(seriesTheme.get(idx).color),
                    disable: colorString.to.rgb(seriesTheme.get(idx).subColor),
                },
            }));
            this.options.initCallback(legendMeta);
        });
    }
}

export default LegendPlugin;
