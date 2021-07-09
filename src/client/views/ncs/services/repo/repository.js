// harborproxy(第三方应用)里的project概念，与轻舟里的project做了映射
import Service from '@micro-app/common/services/service.js';

const apis = {
    // 获取仓库列表
    loads: {
        path: '/{clusterId}/repositories/getRepositories',
        method: 'post',
    },
    // 删除仓库
    delete: {
        path: '/{clusterId}/repositories/deleteRepository',
        method: 'post',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
