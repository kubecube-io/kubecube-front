import BigNumber from 'bignumber.js';

export const log10 = Math.log10 || function(x) {
    const exponent = Math.log(x) * Math.LOG10E; // Math.LOG10E = 1 / Math.LN10.
    // Check for whole powers of 10,
    // which due to floating point rounding error should be corrected.
    const powerOf10 = Math.round(exponent);
    const isPowerOf10 = x === Math.pow(10, powerOf10);

    return isPowerOf10 ? powerOf10 : exponent;
};

function convert(n) {
    const order = Math.floor(Math.log(n) / Math.LN10
                       + 0.000000001); // because float math sucks like that
    return order;
}
function divisors(integer, step) {
    const max = Math.max(integer - step, step);
    for (let i = 0; i < max; i++) {
        const top = step + i;
        const bottom = step - i;
        if (top < integer) {
            if (integer % top === 0) return top;
        }

        if (bottom > 0) {
            if (integer % bottom === 0) return bottom;
        }

    }
    return integer;
}
export function rountToRange(yMinMax, step) {
    const { min, max } = yMinMax;
    if (min === max) {
        const newStep = divisors(10, step);
        return {
            min,
            max: max + 1,
            step: newStep,
            stepSpan: +new BigNumber(1).dividedBy(newStep),
        };
    }
    const span = max - min;
    const magnitude = convert(span) - 1;

    const p = new BigNumber(10);
    const exp = +p.exponentiatedBy(magnitude);
    const newMin = +new BigNumber(Math.floor(min / exp)).multipliedBy(exp);
    const newMax = +new BigNumber(Math.ceil(max / exp)).multipliedBy(exp);

    const newSpan = +new BigNumber(newMax).minus(newMin);
    const minsteps = +new BigNumber(newSpan).dividedBy(exp);
    const newStep = divisors(minsteps, step);
    const stepSpan = +new BigNumber(newSpan).dividedBy(newStep);
    // // console.log(newMin, newMax, newStep, stepSpan)
    return {
        min: newMin,
        max: newMax,
        step: newStep,
        stepSpan,
    };
}

export function getYAxis(minmax, stepSpan) {
    let i = minmax.min;
    const values = [];
    while (i <= minmax.max) {
        values.push(i);
        i = +new BigNumber(i).plus(stepSpan);
    }
    // console.log(values, stepSpan);
    return values;
}


export function getXAxis(min, max, span) {
    const values = [];
    const p = Math.round((max - min) / span);
    let start = min;
    while (start < max) {
        values.push({
            value: start,
        });
        start += p;
    }
    values.push({
        value: max,
    });
    return values;
}

export function getXAxisDiscrete(ref, span) {
    if (span > ref.length || span === ref.length) {
        return ref.map((r, step) => ({
            step,
            value: r,
        }));
    }
    const values = [];
    const length = ref.length;
    const step = Math.round(length / (span - 1));
    let i = 0;

    while (ref[i]) {
        values.push({
            step: i,
            value: ref[i],
        });
        i += step;
    }
    if (i !== length - 1) {
        values.push({
            step: length - 1,
            value: ref[length - 1],
        });
    }
    return values;
}
