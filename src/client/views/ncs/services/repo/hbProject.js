// harborproxy(第三方应用)里的project概念，与轻舟里的project做了映射
import Service from '@micro-app/common/services/service.js';

const apis = {
    // 获取项目列表
    loads: {
        path: '/{clusterId}/projects/getProjects',
        method: 'post',
    },
    // 创建私有镜像库
    create: {
        path: '/{clusterId}/projects/createProject',
        method: 'post',
    },
    // 是否已经创建过私有镜像库
    projectExist: {
        path: '/{clusterId}/projects/projectExists',
        method: 'get',
    },
    // type - 类型，1公有2私有3全部   common
    loadImages: {
        path: '/{clusterId}/projects/getImageLists',
        method: 'get',
        process: (result = {}) => ({
            list: result.repositories || [],
            total: result.total || 0,
            harbor: result.harbor || '',
        }),
    },
    // 判断当前用户是否在当前harbar项目的授权用户【只有授权用户才可以设置密码】
    userExist: {
        path: '/users/userExist',
        method: 'get',
    },
    // 重设密码
    resetPassword: {
        path: '/users/resetPassword',
        method: 'post',
    },
    // 获取当前用户角色信息
    loadUserInfo: {
        path: '/users/getRoleInfo',
        method: 'get',
    },
    loadHarborInfo: {
        path: '/getHarborInfo',
        method: 'get',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
