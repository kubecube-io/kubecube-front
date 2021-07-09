// harborproxy(第三方应用)里的project概念，与轻舟里的project做了映射
import Service from '@micro-app/common/services/service.js';

const apis = {
    // 获取用户列表
    loads: {
        path: '/{clusterId}/projects/{projectId}/getMembers',
        method: 'post',
    },
    // 用户授权
    create: {
        path: '/{clusterId}/projects/{projectId}/addMember',
        method: 'post',
    },
    // 移除用户
    remove: {
        path: '/{clusterId}/projects/{projectId}/deleteMember',
        method: 'post',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
