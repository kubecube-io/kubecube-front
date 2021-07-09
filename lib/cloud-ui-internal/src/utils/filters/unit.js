import isBoolean from 'lodash/isBoolean';
const base = function (mapArr, unitArr, value, isOpen, startUnit, endUnit) {
    let num = value;
    let startIndex = 0;
    let endIndex;
    const result = {
        num: [],
        unit: [],
    };
    if (isNaN(num) || !Array.isArray(mapArr) || !Array.isArray(unitArr))
        return;

    endIndex = mapArr.length;
    if (endIndex !== unitArr.length)
        return;

    if (!isBoolean(isOpen)) {
        endUnit = startUnit;
        startUnit = isOpen;
        isOpen = false;
    }
    if (startUnit)
        startIndex = unitArr.indexOf(startUnit);

    if (startIndex === -1 || !startIndex)
        startIndex = 0;

    if (endUnit) {
        const targetIndex = unitArr.indexOf(endUnit);
        endIndex = targetIndex === -1 ? endIndex : targetIndex;
    }
    if (startIndex > endIndex)
        return;

    num = num - 0;
    if (!isOpen) {
        // 这里逻辑的模型为
        /**
         * 如果指定 endUnit，则会一直追溯到该单位为止
         * let size = [1024, 'K', 'G'];
         * let result = {
         *     num: [1024/1024/1024],
         *     unit: ['G']
         * };
         *
         * 如果没指定 endUnit
         * let size = [1024, 'K'];
         * let result = {
         *     num: [1],
         *     unit: ['M']
         * };
         *
         */
        for (let i = startIndex; i < endIndex; i++) {
            const nextLevel = mapArr[i + 1];
            // 可能没下一级别
            if (nextLevel) {
                const currentNum = num / nextLevel;
                // currentNum 整数部分不为0 或者指定了转换后的单位，则继续执行循环
                if (Math.floor(currentNum) || endUnit) {
                    num = currentNum;
                    result.num = [currentNum];
                    result.unit = [unitArr[i + 1]];
                } else
                    break;
            } else
                break;
        }
        // 如果上一步循环没有结果，就说明不需要转换，则返回最初的值
        if (!result.num.length) {
            result.num = [num];
            result.unit = [unitArr[startIndex]];
        }
    } else {
        // 这里逻辑的模型为
        /**
         * 如果指定 endUnit，则结果会在相应的单位上补0
         * let day = [1000 * 60 * 60, 'ms', 'M'];
         * let result = {
         *     num: [0, 0, 1, 0, 0, 0],
         *     unit: ['M', 'd', 'h', 'm', 's', 'ms']
         * };
         *
         * 如果没指定 endUnit，则结果不会在相应的单位上补0
         * let day = [1000 * 60 * 60, 'ms'];
         * let result = {
         *     num: [1],
         *     unit: ['h']
         * };
         *
         */
        let i = startIndex;
        for (i; i < endIndex; i++) {
            const nextLevel = mapArr[i + 1];
            if (nextLevel && (num || endUnit)) {
                const currentNum = Math.floor(num / nextLevel);
                const remainder = num % nextLevel;
                // 余数放进去，如果指定了 endUnit， 则不管余数是否为 0 都放进去
                if (remainder || (!remainder && result.num.length) || endUnit) {
                    result.num.unshift(remainder);
                    result.unit.unshift(unitArr[i]);
                }
                num = currentNum;
            } else
                break;
        }
        if (num || endUnit || !result.num.length) {
            result.num.unshift(num);
            result.unit.unshift(unitArr[i]);
        }
    }
    return {
        getMinUnit(decimal, isShowMinUnit, unitDecimal, modifiedResult) {
            /**
             * 返回数值加上单位
             */
            const transform = result;
            if (!transform || !transform.num || !transform.unit)
                return;
            if (typeof decimal !== 'number')
                decimal = 0;
            if (isShowMinUnit === undefined)
                isShowMinUnit = false;
            let num = 0;
            let unit = 0;
            const unitObj = {};
            mapArr.forEach((value, index) => {
                unitObj[unitArr[index]] = value;
            });
            for (let i = 0; i < transform.num.length; i++) {
                /**
                 * 将所有单位值对其到最大单位
                 */
                if (transform.num[i] === 0)
                    continue;
                if (num !== 0)
                    num += transform.num[i] / (unitObj[transform.unit[i - 1]]);
                else {
                    num += transform.num[i];
                    unit = i; // 标记最大单位
                }
            }
            // 如果数值为0，unit应为最小单位
            if (!num)
                unit = transform.num.length - 1;
            // 如果指定了unitDecimal并且期中某一个单位未声明精确位数，置decimal为0
            if (typeof unitDecimal === 'object')
                decimal = unitDecimal[transform.unit[unit]] || 0;
            num = parseFloat(num.toFixed(decimal));
            if (!isShowMinUnit) {
                // 在不显示最小单位的情况下，当标记的最大单位和起始单位一致，则不输出单位
                if (transform.unit[unit] === startUnit) {
                    return {
                        num,
                        // unit: startUnit,
                        unit: '',
                    };
                }
            }
            return {
                num,
                unit: transform.unit[unit],
            };
        },
        toString(decimal, isShowMinUnit, unitDecimal) {
            const { num, unit } = this.getMinUnit(decimal, isShowMinUnit, unitDecimal);
            return num + unit;
        },
        num: result.num,
        unit: result.unit,
    };
};

const UNIT_MAP = {
    size: {
        mapArr: [1, 1024, 1024, 1024, 1024, 1024],
        unitArr: ['B', 'K', 'M', 'G', 'T', 'P'],
    },
    day: {
        mapArr: [1, 1000, 60, 60, 24, 30],
        unitArr: ['ms', 's', 'm', 'h', 'd', 'M'],
    },
    count: {
        mapArr: [1000, 1000, 1000, 1000, 1000],
        unitArr: ['b', 'K', 'M', 'G', 'x10'],
    },
    number: {
        mapArr: [1, 10000, 10000],
        unitArr: ['', '万', '亿'],
    },
};
export default {
    /**
     * @param {int} value 数值
     * @param {stirng} startUnit 当前单位
     * @param {stirng} targetUnit 目标单位
     * @param {int} decimal 精确小数位数,应用于所有单位
     * @param {bool} isShowMinUnit 显示最小单位
     * @param {object} unitDecimal 一个unit：decimal的键值对，表明在该unit时需要精确多少位小数
     */
    size(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.size;
        return base(mapArr, unitArr, value, false, startUnit, targetUnit);
    },
    sizeStr(value, startUnit, targetUnit, decimal, isShowMinUnit, unitDecimal) {
        const { mapArr, unitArr } = UNIT_MAP.size;
        return base(mapArr, unitArr, value, false, startUnit, targetUnit).toString(decimal, isShowMinUnit, unitDecimal);
    },
    day(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.day;
        return base(mapArr, unitArr, value, true, startUnit, targetUnit);
    },
    dayStr(value, startUnit, targetUnit, decimal, isShowMinUnit, unitDecimal) {
        const { mapArr, unitArr } = UNIT_MAP.day;
        return base(mapArr, unitArr, value, true, startUnit, targetUnit).toString(decimal, isShowMinUnit, unitDecimal);
    },
    count(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.count;
        return base(mapArr, unitArr, value, true, startUnit, targetUnit);
    },
    countStr(value, startUnit, targetUnit, decimal, isShowMinUnit, unitDecimal) {
        const { mapArr, unitArr } = UNIT_MAP.count;
        // const result = base(mapArr, unitArr, value, true, startUnit, targetUnit);
        // const { num, unit } = result;
        /**
         * 原始数据为1000时，不要显示为1k而是1000，这里调整了num的数据
         * 例：num: [1, 0] unit: ['k', 'b']
         * 调整后： num: [1000] unit: ['b']
         */
        // for (let i = 0; i < num.length; i++) {
        //     if (!num[i] && i !== num.length - 1) {
        //         // 去掉无效的0
        //         num.shift();
        //         unit.shift();
        //         i--;
        //         continue;
        //     }
        //     if (num[i].toString().length === 1 && num[i] && i !== num.length - 1) {
        //         // 如果该单位下为1位数,且不是最后一位
        //         num[i + 1] += num[i] * 1000;
        //         num.shift();
        //         unit.shift();
        //         break;
        //     } else
        //         break;
        // }
        // return result.toString(decimal, isShowMinUnit, undefined, result);
        return base(mapArr, unitArr, value, true, startUnit, targetUnit).toString(decimal, isShowMinUnit, unitDecimal);
    },
    number(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.number;
        return base(mapArr, unitArr, value, false, startUnit, targetUnit);
    },
};
