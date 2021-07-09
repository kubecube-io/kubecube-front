import AsyncValidator from 'vusion-async-validator';

// 目前只考虑支持单个参数的validate
export default class Validator {
    /**
     *
     * @param {*} options
     * @param {string} options.key - 对应的字段key
     * @param {array} options.rules - 对应的字段的验证规格
     * @memberof Validator
     */
    constructor(options) {
        this.options = options;
        this.validator = this.init(options);
    }
    
    init(options) {
        const { key, rules } = options;
        if(!key || !rules)
            throw new Error('请输入对应的参数');

        return new AsyncValidator({ [key]: rules });
    }
    // 字段值, 回调函数
    validate(value, callback) {
        this.validator.validate({[this.options.key]: value}, { firstFields: true }, callback);
    }
}
