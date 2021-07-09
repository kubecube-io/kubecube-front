import { EasingFunctions } from './easing';
const nextFrame = window.requestAnimationFrame;
const RenderMap = new WeakMap();
const BUFFER = 100;
export function tween({
    mutation,
    animation,
    render
}) {
    const {
        duration,
        easing,
    } = animation;
    const easingFunc = EasingFunctions[easing];
    const now = Date.now();
    const {
        getter, setter, to, delay = 0, immediate
    } = mutation;
    const beginValue = getter();
    const spanValue = to - beginValue;
    function end() { setter(to); }
    function set(ratio){
        if(immediate) {
            setter(to);
        } else {
            setter(beginValue + ratio * spanValue);
        }
    }
    const endTime = duration + delay + now + BUFFER;

    let renderContext;
    function renderLoop() {
        if(renderContext.endTime > Date.now()){
            render();
            nextFrame(renderLoop);
        } else {
            renderContext.running = false;
        }
    }
    if (RenderMap.has(render)) {
        renderContext = RenderMap.get(render);
        if(!renderContext.running && endTime > renderContext.endTime) {
            renderContext.endTime = endTime;
            nextFrame(renderLoop);
        }
       
    } else {
        renderContext = {
            endTime,
            renderLoop,
            running: true
        };
        nextFrame(renderLoop);
    }

    let start;
    let elapsed;
    function step(timestamp) {
        if (start === undefined){
            start = timestamp;
        }
        elapsed = timestamp - start;
        let ratio;
        if(delay > 0) {
            const e = elapsed - delay;
            ratio = e < 0 ? 0 : easingFunc(e / duration);
        }else{
            ratio = easingFunc(elapsed / duration);
        }

        if(ratio >= 1) { 
            end();
        } else { 
            if(!step.canceled) {
                set(ratio);
                nextFrame(step);
            }
        }
    }
    nextFrame(step);

    return {
        stop: () => {
            step.canceled = true;
        },
    };
}

 