const dateFormat = (function () {
    const fix = (str) => {
        str = '' + (str || '');
        if (str.length === 0)
            return '00';
        else if (str.length === 1)
            return '0' + str;
        else if (str.length === 2)
            return str;
    };
    const fix1 = (str) => {
        str = '' + (str || '');
        if (str.length === 0)
            return '000';
        else if (str.length === 1)
            return '00' + str;
        else if (str.length === 2)
            return '0' + str;
        else if(str.length === 3)
            return str;
    };
    const MAPS = {
        YYYY(date) { return date.getFullYear(); },
        MM(date) { return fix(date.getMonth() + 1); },
        DD(date) { return fix(date.getDate()); },
        HH(date) { return fix(date.getHours()); },
        mm(date) { return fix(date.getMinutes()); },
        ss(date) { return fix(date.getSeconds()); },
        ms(date) { return fix1(date.getMilliseconds()); },
    };
    const trunk = new RegExp(Object.keys(MAPS).join('|'), 'g');
    return function (value, format) {
        if (!value)
            return '';
        value = new Date(value);
        return format.replace(trunk, (capture) => MAPS[capture] ? MAPS[capture](value) : '');
    };
})();
export default dateFormat;

