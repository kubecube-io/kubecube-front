const rf = window.requestAnimationFrame;

import { EasingFunctions } from './easing';
/**
    s._animy = animate(
        {
            getter: () => s.radius,
            setter: (v) => { s.radius = v },
            to: radius,
            animation: {
            duration: 400,
            easing: 'easeInQuad',
        }
    })
 */
function resolvePartners(partner) {
    return partner.map(part => {
        const {
            getter, setter, to, delay,
        } = part;
        const beginValue = getter();
        const spanValue = to - beginValue;
        // let nowNum = beginValue;
        // let spanBack;
        return {
            // setter,
            delay,
            end() {
                setter(to);
            },
            set(ratio) {
                setter(beginValue + ratio * spanValue);
            },
            // startIv() {
            //     return {
            //         nowNum,
            //         beginValue,
            //     }
            // },
        };
    });
}
let id = 0;
function createStep(partner, animation, render, resolve) {
    const {
        duration,
        easing,
    } = animation;
    const easingFunc = EasingFunctions[easing];


    // const beginValue = getter();
    // const spanValue = to - beginValue;
    const partners = resolvePartners(partner);

    let start;
    let elapsed;

    const delayedPartners = partners.filter(p => p.delay);
    const normalParrtner = partners.filter(p => !p.delay);

    const step = function(timestamp) {
        if (start === undefined) {
            start = timestamp;
        }

        elapsed = timestamp - start;
        let theEnd = true;
        if (normalParrtner.length) {
            const ratio = easingFunc(elapsed / duration);
            if (ratio >= 1) {
                // setter(to);
                normalParrtner.forEach(part => part.end());
            } else {
                theEnd = false;
                normalParrtner.forEach(part => part.set(ratio));
                // setter(beginValue + ratio * spanValue);
            }
        }

        if (delayedPartners.length) {
            delayedPartners.forEach(part => {
                if (elapsed > part.delay) {
                    const localElapsed = elapsed - part.delay;
                    const ratio = easingFunc(localElapsed / duration);
                    if (ratio >= 1) {
                        part.end();
                    } else {
                        theEnd = false;
                        part.set(ratio);
                    }
                }
            });
        }

        render();
        if (!theEnd && !step.canceled) {
            rf(step);
        } else {
            if (theEnd) {
                elapsed = duration;
            }
            // // console.log('end anime',step.id, elapsed, theEnd, step.canceled, partners.length, render.owner)
            resolve(step.canceled);
        }
    };
    step.canceled = false;
    step.id = id++;
    // step.stepBack = () => {
    //     const partner = normalParrtner.map((p) => {
    //         const {
    //             nowNum, nowRatio, beginValue
    //         } = p.startIv();
    //         // console.log(beginValue)
    //         return {
    //             getter: () => nowNum,
    //             setter: (v) => { p.setter(v) },
    //             to: beginValue,
    //         }
    //     });
    //     return {
    //         partner,
    //         animation: {
    //             easing: 'easeInQuad',
    //             duration: elapsed,
    //         },
    //         render,
    //     };
    // }
    return step;
}

export function animate({
    // getter,
    // setter,
    // to,
    animation,
    render,
    partner,
}) {
    let stepFunc;
    let result = 'pending';
    const promise = new Promise((resolve, reject) => {
        stepFunc = createStep(partner, animation, render, resolve, reject);
        rf(stepFunc);
    });
    promise.then(() => {
        result = 'end';
    });

    return {
        getState: () => {
            return result;
        },
        // stepBack: () => {
        //     return animate(stepFunc.stepBack());
        // },
        stop: () => {
            stepFunc.canceled = true;
        },
        then: func => {
            return promise.then(func);
        },
        catch: func => {
            return promise.catch(func);
        },
    };
}
