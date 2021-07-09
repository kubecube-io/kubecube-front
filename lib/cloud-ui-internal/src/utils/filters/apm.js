import _ from 'lodash';
import globalFilters from './index.js';
import _unit from './unit.js';

export default Object.assign({}, globalFilters, {
    apmCountUnit(val) {
        if (val >= 100000000000000)
            return '14';
        return '';
    },
    apmCount(val) {
        const result = _unit.count(val, 'b', 'x10');
        const { num, unit } = result;
        for (let i = 0; i < num.length; i++) {
            if (!num[i] && i !== num.length - 1) {
                // 去掉无效的0
                num.shift();
                unit.shift();
                i--;
                continue;
            }
            if (num[i].toString().length === 1 && num[i] && i !== num.length - 1) {
                // 如果该单位下为1位数,且不是最后一位
                num[i + 1] += num[i] * 1000;
                num.shift();
                unit.shift();
                break;
            } else
                break;
        }
        return result.toString(0, false, undefined, result);
    },
    integer(val) {
        return _.toInteger(val);
    },
    integerRound(val) {
        return Math.round(val);
    },
});
