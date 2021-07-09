import {
    mat2d,
} from 'gl-matrix';

class DPIPlugin {
    apply(globalCtx) {
        globalCtx.hooks.initContext.tap('DPIPlugin', (context, canvasElem) => {
            globalCtx.effect(() => {
                // console.log('canvas bounding change');
                // Get the device pixel ratio, falling back to 1.
                const dpr = window.devicePixelRatio || 1;
                // Get the size of the canvas in CSS pixels.
                const rect = globalCtx.boundingBox;
                // Give the canvas pixel dimensions of their CSS
                // size * the device pixel ratio.
                canvasElem.width = rect.width * dpr;
                canvasElem.height = rect.height * dpr;
                // Scale all drawing operations by the dpr, so you
                // don't have to worry about the difference.
                if(!globalCtx.DPIMat){
                    globalCtx.DPR = dpr;
                    globalCtx.DPIMat = mat2d.create();
                    mat2d.multiplyScalar(globalCtx.DPIMat, globalCtx.DPIMat, dpr);
                }

                canvasElem.style.position = "absolute";
                canvasElem.style.left = "0";
                canvasElem.style.top = "0";
                canvasElem.style.width = `${rect.width}px`;
                canvasElem.style.height = `${rect.height}px`;
                // console.log('canvas bounding end');
            });
        });
    }
}

export default DPIPlugin;
