import Service from '@micro-app/common/services/service.js';

const apis = {
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/openshiftsdn/securitygroups',
    },
    editGlobal: {
        method: 'post',
        path: '/clusters/{clusterId}/openshiftsdn/securitygroups/global',
    },
    // 同时支持安全组的添加、设置和删除操作
    editJoined: {
        method: 'post',
        path: '/clusters/{clusterId}/openshiftsdn/securitygroups/joined',
    },
};

// /ncs/proxy 为前端代理接口需要带的前缀
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;

