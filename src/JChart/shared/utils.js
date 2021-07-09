import {
    maxBy,
    minBy,
    get,
} from 'lodash';
import {
    Bezier,
} from 'bezier-js';

import BigNumber from 'bignumber.js';

export function findMinMax(data, legend) {
    return {
        max: get(maxBy(data, o => get(o, legend, -Infinity)), legend),
        min: get(minBy(data, o => get(o, legend, Infinity)), legend),
    };
}

export const REFERENCE_TYPE = {
    discrete: 'discrete',
    continuous: 'continuous',
};


export function decodeStringValues(expr) {
    if (typeof expr === 'number') return () => expr;
    if (typeof expr === 'string') {
        if (expr.endsWith('%')) {
            return num => num * parseFloat(expr) / 100;
        }
        if (expr.endsWith('px')) {
            return () => parseFloat(expr);
        }
    }
    throw 'type false';
}

function sqr(x) {
    return x * x;
}

function dist2(v, w) {
    return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
}

// p - point
// v - start point of segment
// w - end point of segment
export function distToSegmentSquared(p, v, w) {
    const l2 = dist2(v, w);
    if (l2 === 0) return dist2(p, v);
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]);
}

// p - point
// v - start point of segment
// w - end point of segment
export function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}

export function bezierPoints(p1, p2) {
    const span = (p2[0] - p1[0]) / 2;
    return [ p1[0] + span, p1[1], p2[0] - span, p2[1], p2[0], p2[1] ];
}

export function distToBezierSegmentSquared(p, v, w) {
    const bp = bezierPoints(v, w);
    const b = new Bezier(v[0], v[1], bp[0], bp[1], bp[2], bp[3], bp[4], bp[5]);

    const point = b.project({ x: p[0], y: p[1] });
    const d = dist2(p, [ point.x, point.y ]);
    return d;
}


export function pointInPolygon(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    const x = point[0],
        y = point[1];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0],
            yi = vs[i][1];
        const xj = vs[j][0],
            yj = vs[j][1];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}


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

export function getYAxis(minmax) {
    let i = minmax.min;
    const values = [];
    while (i <= minmax.max) {
        values.push(i);
        i = +new BigNumber(i).plus(minmax.stepSpan);
    }
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
