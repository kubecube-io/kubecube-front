import { prefixV1, prefix } from '../base.js';

export default {
    /**
     * 获取错误规则列表
     */
    errorRules: {
        path: prefixV1 + '/errorRules',
        method: 'get',
    },
    /**
     * 创建错误规则
     */
    createRules: {
        path: prefixV1 + '/{type}Rules', // exceptionRules,httpStatusCodeRules,logRules
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    /**
     * 修改错误规则
     */
    modifyRules: {
        path: prefixV1 + '/{type}Rules/{ruleId}',
        method: 'put',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    /**
     * 删除错误规则
     */
    deleteRules: {
        path: prefixV1 + '/{type}Rules/{ruleId}',
        method: 'delete',
    },
};
