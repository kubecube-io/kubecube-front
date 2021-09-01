import { get, isPlainObject } from 'lodash';
import BigNumber from 'bignumber.js';
import parseMS from 'parse-ms';
export function setValueIfListNotPresent({
    list,
    path,
    current,
},
callback) {
    const t = list.find(c => get(c, path, null) === current);
    if (list.length && !t) {
        callback(list[0]);
    } else {
        callback(t);
    }
}

export const unitConvert = (value = '', type = 'memory') => {
    const defaultValue = type === 'memory' ? 128 : 0.1;
    const defaultMagnification = type === 'memory' ? Math.pow(1024, 2) : 1;
    if (!value) { return defaultValue; }
    const MAP_1000 = [ 'k', 'M', 'G', 'T', 'P', 'E' ];
    const MAP_1024 = [ 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei' ];
    const numberValue = parseInt(value);
    if (value.endsWith('m')) { return type === 'memory' ? Math.ceil(numberValue / 1000 / defaultMagnification) : Math.ceil(numberValue / defaultMagnification) / 1000; }
    if (value === JSON.stringify(numberValue)) { return Math.ceil(numberValue / defaultMagnification); }

    const map = value.endsWith('i') ? MAP_1024 : MAP_1000;
    const magnification = value.endsWith('i') ? 1024 : 1000;
    const index = map.findIndex(unit => value.endsWith(unit));
    return index !== -1 ? Math.ceil(numberValue * Math.pow(magnification, index + 1) / defaultMagnification) : numberValue;
};

// to plain
const cpuUnits = [ 'k', 'M', 'G', 'T', 'P', 'E' ];
export const unitConvertCPU = value => {
    value = `${value}`;
    const valueNum = +(value.replace(/(m|k|M|G|T|P|E)/g, ''));
    if (`${valueNum}` === value) return valueNum;
    if (value.endsWith('m')) return +new BigNumber(valueNum).dividedBy(1000);
    let i = 0;
    while (!value.endsWith(cpuUnits[i]) && i < cpuUnits.length) { i++; }

    return valueNum * (+new BigNumber(10).exponentiatedBy(i * 3 + 3));
};

// to Mi
const memUnits = [ 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei' ];
export const unitConvertMemory = value => {
    const valueNum = +(value.replace(/(K|M|G|T|P|E)i/g, ''));
    if (`${valueNum}` === value) return value;
    let i = 0;
    while (!value.endsWith(memUnits[i]) && i < memUnits.length) { i++; }
    return valueNum * (+new BigNumber(1024).exponentiatedBy(i - 1));
};

// byte to ...
const units = [ 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
export const BPSunits = [ 'Bps', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps', 'EBps', 'ZBps', 'YBps' ];
export function niceBytes(x, us = units) {
    let l = 0,
        n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
        n = n / 1024;
    }
    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + us[l]);
}
export const flattenkeys = obj => {
    const flattened = [];
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (isPlainObject(value)) {
            const internalKeys = flattenkeys(value);
            internalKeys.forEach(internalKey => {
                flattened.push(`${key}.${internalKey}`);
            });
        } else {
            flattened.push(key);
        }
    });
    return flattened;
};

const timeKeys = [ 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'microseconds', 'nanoseconds' ];
const timeUnit = [ 'd', 'h', 'm', 's', 'ms', 'μs', 'ns' ];
export function niceTiming(second) {
    const parsed = parseMS(+second * 1000);
    const str = [];
    timeKeys.forEach((k, idx) => {
        if (parsed[k]) {
            str.push(`${parsed[k]}${timeUnit[idx]}`);
        }
    });
    return str.slice(0, 3).join('');
}


export const getPeriod = (startTime, endTime) => {
    const magnifications = [ 60, 60, 24 ];
    let tmp = (endTime ? Date.parse(endTime) - Date.parse(startTime) : Date.now() - Date.parse(startTime)) / 1000;
    const values = [];
    magnifications.forEach((item, index, list) => {
        if (tmp > 0) {
            values[index] = Math.floor(tmp % item);
            tmp = Math.floor(tmp / item);
        } else {
            values[index] = 0;
        }

        if (index === list.length - 1) {
            values[index + 1] = tmp;
        }
    });

    let usedValues = [];
    values.reverse().some((item, index, list) => {
        // 从更大的时间刻度开始，如果为0，则忽略对应的展示。第一个不为0的后续时间刻度都要展示
        if (item) {
            const tmp = list.slice(index);
            usedValues = [ '天', '小时', '分', '秒' ].slice(index).map((subItem, subIndex) => tmp[subIndex] + subItem).join('');
            return true;
        }
        return false;

    });
    return usedValues;
};

const PERIOD_MAP = [ 0, 6 * 60, 24 * 60, 24 * 7 * 60, 30 * 24 * 60 ];
const STEP_MAP = [ '1m', '2m', '15m', '6h', '1d' ];
const STEP_TIME_MAP = [ 60, 2 * 60, 15 * 60, 6 * 60 * 60, 24 * 60 * 60 ];
function getMapValue(startTime, endTime, mapping) {
    const isSecond = `${endTime}`.length < 12;
    // 换算成分钟
    const period = (endTime - startTime) / (isSecond ? 60 : 60 * 1000);

    let i = PERIOD_MAP.length - 1;
    for (; i > 0; i--) {
        const s = PERIOD_MAP[i];
        if (period > s) break;
    }
    return mapping[i];
}
export const getStep = (startTime, endTime) => {
    return getMapValue(startTime, endTime, STEP_MAP);
};

export const getStepTime = (startTime, endTime) => {
    return getMapValue(startTime, endTime, STEP_TIME_MAP);
};

export function retryAsync(func, step, times) {
    let r;
    let j;
    const promise = new Promise((resolve, reject) => { r = resolve; j = reject; });

    let counter = 0;
    function request() {
        func().then(() => {
            r();
        }).catch(err => {
            if (counter < times) {
                counter++;
                setTimeout(request, step);
            } else {
                j(err);
            }
        });
    }
    request();

    return promise;
}


export function combineRouterParams(...params) {
    return params.map(p => `[${p}]`).join('-');
}
export function departRouteParams(param) {
    const q = param.split(']-[');
    q[0] = q[0].substring(1);
    q[q.length - 1] = q[q.length - 1].substring(0, q[q.length - 1].length - 1);
    return q;
}

export function encodeQueryObject(query) {
    return Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
}

export function niceSeconds(second) {
    const date = new Date(second * 1000).toLocaleString();
    const p = /(\d?\d:\d\d:\d\d)/.exec(date);
    const timestr = p[1];
    if (timestr.length === 7) {
        return `0${timestr}`;
    }
    return timestr;
}


export function readFile(file) {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onerror = () => {
            fileReader.abort();
            reject(new Error('Problem parsing file'));
        };

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.readAsText(file);
    });
}
