import Service from './service.js';

const Version = '2018-11-19';

const TXService = {
    // 获取全部组件信息
    loadSummary: {
        method: 'get',
        path: '',
        query: {
            Action: 'DescribeTxSummary',
            Version,
        },
        process: (result = {}) => result,
    },
};

// /gtxs/proxy 为前端代理接口需要带的前缀
const service = new Service(TXService, '/gtxs/proxy/gtxs');

export default service;
