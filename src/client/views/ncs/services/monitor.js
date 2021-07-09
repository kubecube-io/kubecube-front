import Service from '@micro-app/common/services/service.js';
import { at } from 'lodash';
const apis = {
    load: {
        method: 'get',
        path: '/query',
        process: (result) => {
            const [tmp] = at(result || {}, [ 'data[0].samples[0].value' ]);
            return tmp || 0;
        },
    },
    loadRange: {
        method: 'get',
        path: '/query_range',
    },
    // 和load是同一个接口 ，但是会返回完整信息
    loadAllInfo: {
        method: 'get',
        path: '/query',
        process: (result) => {
            return result.data;
        },
    },

};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends/monitor');

export default service;
