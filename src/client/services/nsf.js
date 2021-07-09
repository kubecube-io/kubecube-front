import Service from './service.js';

const metaapis = {
    // 获取全部组件信息
    getAllEnvInfo: {
        method: 'get',
        path: '/api/metadata',
        query: {
            Action: 'GetAllEnvInfo',
            Version: '2018-11-1',
        },
        process: ({ Result = [] }) => Result,
    },
};

const meta = new Service(metaapis, '/meta/redirect');
const service = Object.assign({}, meta);
export default service;
