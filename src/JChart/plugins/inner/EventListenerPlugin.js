import { throttle } from 'lodash';
class EventListenerPlugin {
    constructor() {
        this.name = 'EventListener';
        // this.mouse = reactive({
        //     x: 0,
        //     y: 0,
        //     event: '',
        // });
    }

    apply(globalCtx) {
        globalCtx.Overlayer.hooks.initOverlayer.tap(this.name, () => {
            // console.log('init event listener');
            this.addEventListener(globalCtx);
        });
    }

    addEventListener(globalCtx) {
        const canvasElem = globalCtx.Overlayer.canvasElm;
        // this.bindListener(canvasElem, 'wheel', globalCtx);

        this.bindListener(canvasElem, 'pointerdown', globalCtx);
        this.bindThrottleListener(canvasElem, 'pointermove', globalCtx);
        this.bindListener(canvasElem, 'pointerup', globalCtx);

        // this.bindListener(canvasElem, 'touchstart', globalCtx);
        // this.bindListener(canvasElem, 'touchmove', globalCtx);
        // this.bindListener(canvasElem, 'touchend', globalCtx);

        // this.bindListener(canvasElem, 'mousedown', globalCtx);
        // this.bindListener(canvasElem, 'mousemove', globalCtx);
        // this.bindListener(canvasElem, 'mouseup', globalCtx);

        this.bindListener(canvasElem, 'mouseenter', globalCtx);
        this.bindListener(canvasElem, 'mouseleave', globalCtx);
        // globalCtx._mouse = this.mouse;
    }

    bindThrottleListener(elem, event, globalCtx) {
        elem.addEventListener(event, throttle(e => {
            e.preventDefault();
            // // console.log(event);
            Object.assign(globalCtx._mouse, {
                x: e.offsetX,
                y: e.offsetY,
                deltaY: e.deltaY,
                event,
            });
        }, 16));
    }

    bindListener(elem, event, globalCtx) {
        elem.addEventListener(event, e => {
            e.preventDefault();
            // // console.log(event);
            Object.assign(globalCtx._mouse, {
                x: e.offsetX,
                y: e.offsetY,
                deltaY: e.deltaY,
                event,
            });
        }, false);
    }
}

export default EventListenerPlugin;
