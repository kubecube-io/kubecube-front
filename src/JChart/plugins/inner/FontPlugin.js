const FontPlugin = {
    apply(globalCtx) {
        globalCtx.hooks.initContext.tap('FontPlugin', (context, canvasElem, container) => {
            const font = getComputedStyle(container).font;
            const fontSize = parseFloat(font);
            const axisBottomArea = fontSize/2;
            globalCtx.fontInWrapper = {
                fontSize,
                axisBottomArea
            };
            context.font = `${fontSize}px arial`;
        });
    }
};

export default FontPlugin;
