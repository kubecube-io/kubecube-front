import { prefixV1, prefix } from '../base.js';
export default {
    /**
     * 获取空间下监控数据概览
     */
    search: {
        path: prefixV1 + '/transactionOverviews/{traceId}',
        method: 'get',
    },
    callChain: {
        path: prefixV1 + '/callTree/{transId}',
        method: 'get',
    }
};