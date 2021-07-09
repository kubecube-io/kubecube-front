// harborproxy(第三方应用)里的project概念，与轻舟里的project做了映射
import Service from '@micro-app/common/services/service.js';

const apis = {
    loads: {
        method: 'get',
        path: '/chartrepo/getVersionList',
    },
    load: {
        method: 'get',
        path: '/chartrepo/version',
    },
    delete: {
        method: 'delete',
        path: '/chartrepo/version',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
