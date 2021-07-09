export default {
    // 将"" undefined undefined/undefined -/undefined -/- 统一转换为 ‘-’
    correctDisplay(s) {
        return /(undefined|-\/|\/-|^$)/.test(s) ? '-' : s;
    },
    logoCode(value) {
        return value && value.slice(0, 2).toUpperCase() || '...';
    },
    /**
     * 根据原始对象属性，从目标对象提取非空值
     * ```
     *     var obj0 = {a:0,b:1},
     *         obj1 = {a:"a",b:"b",c:"c"};
     *     // 根据obj0的属性,从obj1拷贝非null属性到obj0中
     *     // 结果是obj0.a = "a",obj.b = "b",没有拷贝c属性;
     *     var obj = mergeExist(obj0,obj1);
     * ```
     *
     * @param  {Object} target - 目标对象
     * @param  {Object} origin - 原始对象
     * @return {Object}        合并后的对象
     */
    mergeExist: function mergeExist(target, origin) {
        if (origin) {
            for (const key in origin) {
                const value = origin[key];

                // eslint-disable-next-line
                if (target[key] !== undefined && value != null) {
                    if (value instanceof Array)
                        target[key] = target[key].concat(value);
                    else if ((value instanceof Object) && Object.keys(value).length)
                        mergeExist(value);
                    else if (typeof value !== 'boolean')
                        target[key] = value;
                }
            }
        }
        return target;
    },

    /**
     * 连接url和query
     * @param {string} - url
     * @param {object|string} query - 参数对象
     * @returns {string} queryStr
     * @description 会将!!运算之后为false的值忽略
     */
    concatURL(url, query) {
        let queryStr = '';
        if (query instanceof String)
            queryStr = query;
        else if (query instanceof Object) {
            queryStr = Object.keys(query)
                .map((item) => query[item] ? (item + '=' + query[item]) : '')
                .filter((item) => item).join('&');
        } else
            queryStr = (query || '').toString();

        if (queryStr)
            url += ((url.indexOf('?') === -1 ? '?' : '&') + queryStr);

        return url;
    },
    /**
     * 第一个字母大写
     */
    capitalize(str = '') {
        return str.toLowerCase().replace(/( |^)[a-z]/g, (c) => c.toUpperCase());
    },
};
