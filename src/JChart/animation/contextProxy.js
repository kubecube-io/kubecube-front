/*
  Created by Mike Chambers
  Copyright 2018

  Released under an MIT License

  https://github.com/mikechambers

  ES6 JavaScript module and class that proxies,
  captures and batches all canvas context 2d api
  calls.

  This can be useful if you want to transform the
  output and calls into another format such as SVG.

  To use, just pass the context from the canvas into
  the constructor and make context calls on it as normal.
  The second argument to the construtor is a boolean which
  specifies whether the calls will be executed immediately
  or batched until render is call (default is true)

  calls will be batched until you call render.

  import Context2D from "./context_proxy.js"
  let ctx = canvas.getContext("2d);
  let context = new Context2D(ctx, true);

  context.beginPath();
  context.arc(100, 100, 50, 0, Math.PI * 2);
  context.stroke();

  context.render();

  You can also set:

  context.debug = true;

  to get some runtime
  information sent to the // console (currently just number
  of calls / commands about to be run, as well as time it
  took to make the calls).

  Note there is room for performance optimizations, but I
  wanted to share this as a general template in case
  anyone else found it useful.

  Please post any suggestions, fixes in the comments
  */
import { isFunction } from 'lodash';
// import Animation from './Animation';
// export default class Context extends Animation {

CanvasRenderingContext2D.prototype.wrapText = function(text, x, y, maxWidth, lineHeight) {
    if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
        return;
    }
    const context = this;
    const canvas = context.canvas;

    if (typeof maxWidth === 'undefined') {
        maxWidth = (canvas && canvas.width) || 300;
    }
    if (typeof lineHeight === 'undefined') {
        lineHeight = 20;
    }
    const arrText = text.split(',');
    let line = '';
    for (let n = 0; n < arrText.length; n++) {
        const testLine = (line + arrText[n]).trim();
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = arrText[n];
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line.trim(), x, y);
};

export default class Context {
    constructor(context, capture = false) {
    //   super(options.animation);
        this._context = context;
        this._commands = [];
        this._capture = capture;
        this._debug = false;

    }

    handleCommand(cmd) {
        if (this._capture) {
            this._commands.push(cmd);
        } else {
            cmd();
        }
    }

    clearCommands() {
        this._commands = [];
    }

    functionCallWithCondition(func, condition, ...args) {
        func = this._context[func];
        const c = () => {
            if (condition()) {
                func.apply(this._context, args);
            }
        };

        this.handleCommand(c);
    }

    functionCallWithDynamicParameter(func, ...argus) {
        func = this._context[func];
        const c = () => {
            const parameters = argus.map(arg => {
                if (isFunction(arg)) {
                    return arg();
                }
                return arg;
            });
            // // console.log(parameters)
            func.apply(this._context, parameters);
        };

        this.handleCommand(c);
    }

    functionCallWithLooping(loopTargetFunc, func) {
        const c = () => {
            const loopTarget = loopTargetFunc();
            loopTarget.forEach((t, idx) => {
                func(this._context, loopTarget, t, idx);
            });
        };
        this.handleCommand(c);
    }

    propertySetWithDynamicParameter(property, value) {
        const c = () => {
            let v;
            if (isFunction(value)) {
                v = value();
            }
            this._context[property] = v;
        };

        this.handleCommand(c);
    }

    addConditionBlockBegin(condition) {
        const c = {
            beginCondition: () => condition(),
        };
        this.handleCommand(c);
    }

    addConditionBlockEnd() {
        const c = {
            endCondition: true,
        };
        this.handleCommand(c);
    }

    functionsCallWithDynamicParameter(computeValues, operations) {
        const c = () => {
            const values = computeValues();
            operations(this._context, values);
        };
        this.handleCommand(c);
    }

    render() {
        let start;
        if (this._debug) {
            start = Date.now();
        }
        let condition = false;
        for (const command of this._commands) {
            if (command.endCondition) {
                condition = false;
                continue;
            }
            if (command.beginCondition) {
                condition = command.beginCondition();
                continue;
            }
            if (condition) {
                continue;
            }
            command();
        }
        // this.clearCommands();

        // if (this._debug) {
        //     // console.log(`RENDER_COMPLETE : ${Date.now() - start}ms`);
        // }
    }

    onStopAnimation() {
        this.clearCommands();
    }

    set debug(value) {
        this._debug = value;
    }
    get debug() {
        return this._debug;
    }

    get canvas() {
        return this._context.canvas;
    }

    /** ***** currentTransform*******/
    set currentTransform(value) {
        const c = () => {
            this._context.currentTransform = value;
        };

        this.handleCommand(c);
    }

    get currentTransform() {
        return this._context.currentTransform;
    }

    /** ***** direction*******/
    set direction(value) {
        const c = () => {
            this._context.direction = value;
        };

        this.handleCommand(c);
    }

    get direction() {
        return this._context.direction;
    }

    /** ***** fillStyle*******/
    set fillStyle(value) {
        const c = () => {
            this._context.fillStyle = value;
        };

        this.handleCommand(c);
    }

    get fillStyle() {
        return this._context.fillStyle;
    }

    /** ***** filter*******/
    set filter(value) {
        const c = () => {
            this._context.filter = value;
        };

        this.handleCommand(c);
    }

    get filter() {
        return this._context.filter;
    }

    /** ***** font*******/
    set font(value) {
        const c = () => {
            this._context.font = value;
        };

        this.handleCommand(c);
    }

    get font() {
        return this._context.font;
    }

    /** ***** globalAlpha*******/
    set globalAlpha(value) {
        const c = () => {
            this._context.globalAlpha = value;
        };

        this.handleCommand(c);
    }

    get globalAlpha() {
        return this._context.globalAlpha;
    }

    /** ***** globalCompositeOperation*******/
    set globalCompositeOperation(value) {
        const c = () => {
            this._context.globalCompositeOperation = value;
        };

        this.handleCommand(c);
    }

    get globalCompositeOperation() {
        return this._context.globalCompositeOperation;
    }

    /** ***** imageSmoothingEnabled*******/
    set imageSmoothingEnabled(value) {
        const c = () => {
            this._context.imageSmoothingEnabled = value;
        };

        this.handleCommand(c);
    }

    get imageSmoothingEnabled() {
        return this._context.imageSmoothingEnabled;
    }

    /** ***** imageSmoothingQuality*******/
    set imageSmoothingQuality(value) {
        const c = () => {
            this._context.imageSmoothingQuality = value;
        };

        this.handleCommand(c);
    }

    get imageSmoothingQuality() {
        return this._context.imageSmoothingQuality;
    }

    /** ***** lineCap*******/
    set lineCap(value) {
        const c = () => {
            this._context.lineCap = value;
        };

        this.handleCommand(c);
    }

    get lineCap() {
        return this._context.lineCap;
    }

    /** ***** lineDashOffset*******/
    set lineDashOffset(value) {
        const c = () => {
            this._context.lineDashOffset = value;
        };

        this.handleCommand(c);
    }

    get lineDashOffset() {
        return this._context.lineDashOffset;
    }

    /** ***** lineJoin*******/
    set lineJoin(value) {
        const c = () => {
            this._context.lineJoin = value;
        };

        this.handleCommand(c);
    }

    get lineJoin() {
        return this._context.lineJoin;
    }

    /** ***** lineWidth*******/
    set lineWidth(value) {
        const c = () => {
            this._context.lineWidth = value;
        };

        this.handleCommand(c);
    }

    get lineWidth() {
        return this._context.lineWidth;
    }

    /** ***** miterLimit*******/
    set miterLimit(value) {
        const c = () => {
            this._context.miterLimit = value;
        };

        this.handleCommand(c);
    }

    get miterLimit() {
        return this._context.miterLimit;
    }

    /** ***** shadowBlur*******/
    set shadowBlur(value) {
        const c = () => {
            this._context.shadowBlur = value;
        };

        this.handleCommand(c);
    }

    get shadowBlur() {
        return this._context.shadowBlur;
    }

    /** ***** shadowColor*******/
    set shadowColor(value) {
        const c = () => {
            this._context.shadowColor = value;
        };

        this.handleCommand(c);
    }

    get shadowColor() {
        return this._context.shadowColor;
    }

    /** ***** shadowOffsetX*******/
    set shadowOffsetX(value) {
        const c = () => {
            this._context.shadowOffsetX = value;
        };

        this.handleCommand(c);
    }

    get shadowOffsetX() {
        return this._context.shadowOffsetX;
    }

    /** ***** shadowOffsetY*******/
    set shadowOffsetY(value) {
        const c = () => {
            this._context.shadowOffsetY = value;
        };

        this.handleCommand(c);
    }

    get shadowOffsetY() {
        return this._context.shadowOffsetY;
    }

    set strokeStyle(value) {
        const c = () => {
            this._context.strokeStyle = value;
        };

        this.handleCommand(c);
    }

    get strokeStyle() {
        return this._context.strokeStyle;
    }

    /** ***** textAlign*******/
    set textAlign(value) {
        const c = () => {
            this._context.textAlign = value;
        };

        this.handleCommand(c);
    }

    get textAlign() {
        return this._context.textAlign;
    }

    /** ***** textBaseline*******/
    set textBaseline(value) {
        const c = () => {
            this._context.textBaseline = value;
        };

        this.handleCommand(c);
    }

    get textBaseline() {
        return this._context.textBaseline;
    }

    addHitRegion(...args) {
        const c = () => {
            this._context.addHitRegion(...args);
        };

        this.handleCommand(c);
    }
    arc(...args) {
        const c = () => {
            this._context.arc(...args);
        };

        this.handleCommand(c);
    }
    arcTo(...args) {
        const c = () => {
            this._context.arcTo(...args);
        };

        this.handleCommand(c);
    }
    beginPath(...args) {
        const c = () => {
            this._context.beginPath(...args);
        };

        this.handleCommand(c);
    }
    bezierCurveTo(...args) {
        const c = () => {
            this._context.bezierCurveTo(...args);
        };

        this.handleCommand(c);
    }
    clearHitRegions(...args) {
        const c = () => {
            this._context.clearHitRegions(...args);
        };

        this.handleCommand(c);
    }
    clearRect(...args) {
        const c = () => {
            this._context.clearRect(...args);
        };

        this.handleCommand(c);
    }
    clip(...args) {
        const c = () => {
            this._context.clip(...args);
        };

        this.handleCommand(c);
    }
    closePath(...args) {
        const c = () => {
            this._context.closePath(...args);
        };

        this.handleCommand(c);
    }
    createImageData(...args) {
        const c = () => {
            this._context.createImageData(...args);
        };

        this.handleCommand(c);
    }
    createLinearGradient(...args) {
        const c = () => {
            this._context.createLinearGradient(...args);
        };

        this.handleCommand(c);
    }
    createPattern(...args) {
        const c = () => {
            this._context.createPattern(...args);
        };

        this.handleCommand(c);
    }
    createRadialGradient(...args) {
        const c = () => {
            this._context.createRadialGradient(...args);
        };

        this.handleCommand(c);
    }
    drawFocusIfNeeded(...args) {
        const c = () => {
            this._context.drawFocusIfNeeded(...args);
        };

        this.handleCommand(c);
    }
    drawImage(...args) {
        const c = () => {
            this._context.drawImage(...args);
        };

        this.handleCommand(c);
    }
    drawWidgetAsOnScreen(...args) {
        const c = () => {
            this._context.drawWidgetAsOnScreen(...args);
        };

        this.handleCommand(c);
    }
    drawWindow(...args) {
        const c = () => {
            this._context.drawWindow(...args);
        };

        this.handleCommand(c);
    }
    ellipse(...args) {
        const c = () => {
            this._context.ellipse(...args);
        };

        this.handleCommand(c);
    }
    fill(...args) {
        const c = () => {
            this._context.fill(...args);
        };

        this.handleCommand(c);
    }
    fillRect(...args) {
        const c = () => {
            this._context.fillRect(...args);
        };

        this.handleCommand(c);
    }
    fillText(...args) {
        const c = () => {
            this._context.fillText(...args);
        };

        this.handleCommand(c);
    }
    getImageData(...args) {
        const c = () => {
            this._context.getImageData(...args);
        };

        this.handleCommand(c);
    }
    getLineDash(...args) {
        const c = () => {
            this._context.getLineDash(...args);
        };

        this.handleCommand(c);
    }
    isPointInPath(...args) {
        const c = () => {
            this._context.isPointInPath(...args);
        };

        this.handleCommand(c);
    }
    isPointInStroke(...args) {
        const c = () => {
            this._context.isPointInStroke(...args);
        };

        this.handleCommand(c);
    }
    lineTo(...args) {
        const c = () => {
            this._context.lineTo(...args);
        };

        this.handleCommand(c);
    }
    wrapText(...args) {
        const c = () => {
            this._context.wrapText(...args);
        };

        this.handleCommand(c);
    }
    moveTo(...args) {
        const c = () => {
            this._context.moveTo(...args);
        };

        this.handleCommand(c);
    }
    putImageData(...args) {
        const c = () => {
            this._context.putImageData(...args);
        };

        this.handleCommand(c);
    }
    quadraticCurveTo(...args) {
        const c = () => {
            this._context.quadraticCurveTo(...args);
        };

        this.handleCommand(c);
    }
    rect(...args) {
        const c = () => {
            this._context.rect(...args);
        };

        this.handleCommand(c);
    }
    removeHitRegion(...args) {
        const c = () => {
            this._context.removeHitRegion(...args);
        };

        this.handleCommand(c);
    }
    resetTransform(...args) {
        const c = () => {
            this._context.resetTransform(...args);
        };

        this.handleCommand(c);
    }
    restore(...args) {
        const c = () => {
            this._context.restore(...args);
        };

        this.handleCommand(c);
    }
    rotate(...args) {
        const c = () => {
            this._context.rotate(...args);
        };

        this.handleCommand(c);
    }
    save(...args) {
        const c = () => {
            this._context.save(...args);
        };

        this.handleCommand(c);
    }
    scale(...args) {
        const c = () => {
            this._context.scale(...args);
        };

        this.handleCommand(c);
    }
    scrollPathIntoView(...args) {
        const c = () => {
            this._context.scrollPathIntoView(...args);
        };

        this.handleCommand(c);
    }
    setLineDash(...args) {
        const c = () => {
            this._context.setLineDash(...args);
        };

        this.handleCommand(c);
    }
    setTransform(...args) {
        const c = () => {
            this._context.setTransform(...args);
        };

        this.handleCommand(c);
    }
    stroke(...args) {
        const c = () => {
            this._context.stroke(...args);
        };

        this.handleCommand(c);
    }
    strokeRect(...args) {
        const c = () => {
            this._context.strokeRect(...args);
        };

        this.handleCommand(c);
    }
    strokeText(...args) {
        const c = () => {
            this._context.strokeText(...args);
        };

        this.handleCommand(c);
    }
    transform(...args) {
        const c = () => {
            this._context.transform(...args);
        };

        this.handleCommand(c);
    }
    // getTransform() {
    //     let c = () => {
    //         // console.log(this._context.getTransform());
    //     };
    //     this.handleCommand(c);
    // }
    translate(...args) {
        const c = () => {
            this._context.translate(...args);
        };

        this.handleCommand(c);
    }
}
