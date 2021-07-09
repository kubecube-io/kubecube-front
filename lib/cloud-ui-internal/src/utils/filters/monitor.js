import UnitFormat from './unit';

export default function netUnitTransform(typeList, needTransform, callback, defaultUnit) {
    defaultUnit = defaultUnit || 'K';
    return function (result) {
        let max = 0;
        result.forEach((item) => {
            for (const name of typeList) {
                if (needTransform && item[name])
                    item[name] = item[name] * 8;

                if (item[name] && item[name] > max)
                    max = item[name];
            }
        });
        let targetUnit = UnitFormat.size(max, defaultUnit).unit[0];
        result.forEach((item) => {
            for (const name of typeList) {
                if (item[name]) {
                    if (targetUnit !== defaultUnit)
                        item[name] = UnitFormat.size(item[name], defaultUnit, targetUnit).num[0].toFixed(3);
                    else
                        item[name] = item[name].toFixed(3);
                }
            }
        });
        if (targetUnit === 'B')
            targetUnit = '';

        if (typeof callback === 'function') {
            callback.call(this, targetUnit + 'bps');
        } else if (this.$attrs)
            this.unit = targetUnit + 'bps';

        return result;
    };
}
