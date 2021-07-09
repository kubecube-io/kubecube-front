/**
 * 平台相关接口，具体接口信息可查看 Gportal 地址：http://gportal.cloud.126.net/gateway/interfaces 选择所属服务为 skiff
 */
import Service from './service.js';
const prefix = '/auth/proxy';
const version = '2018-08-09';
const path = '/authority';

const uiPermissionsProcess = ({ Permissions = [] }) => {
    const map = {};
    const UIPermissions = Permissions.find((p) => p.ResourceType === 'UI');
    UIPermissions && UIPermissions.OperationTypes.forEach((res) => map[res] = true);
    return map;
};

const apis = {
    // 全量显示租户或项目列表
    listAllScopes: {
        Offset: 0,
        Limit: 1000,
        action: 'DescribePermissionScopes',
    },
    // 全量显示成员可见租户或项目列表
    listUserAllScopes: {
        Offset: 0,
        Limit: 1000,
        action: 'DescribeUserPermissionScopes',
    },
    // 获取成员为管理员角色的租户或项目列表
    listAdminUserScopes: {
        action: 'DescribeUserAdminPermissionScopes',
    },
    // 获取租户或项目下的成员信息
    listScopeMembers: {
        action: 'DescribeScopeMembers',
    },
    // 获取租户或项目下所有管理员列表
    listAdminUsers: {
        action: 'DescribeAdminUsers',
    },
    // 获取域的信息
    getScopeInfo: {
        action: 'DescribePermissionScope',
    },
    // 获取成员在租户或项目下的角色信息
    getMemberRole: {
        action: 'DescribeRoles',
    },
    // 获取单个成员的信息
    getUser: {
        action: 'DescribeUserInfo',
    },
    // 获取前端根据所属租户下拥有的权限来显示不同页面元素的信息
    getUIPermissions: {
        action: 'DescribeUIPermissions',
        process: uiPermissionsProcess,
    },
    DescribeUIPermissions: {
        action: 'DescribeUIPermissions',
    },
    // 获取顶栏右上角下拉列表可显示的平台权限管理入口信息
    getGlobalUIPermissions: {
        action: 'DescribeGlobalUIPermissions',
        process: uiPermissionsProcess,
    },
    // 获取 cookie 应该被写入的主域名称以及各子模块的域名，若域名返回为空，则该模块不会被部署
    getCookieDomain: {
        action: 'DescribeDomains',
    },
    getAccountId: {
        action: 'DescribeAccountId',
    },
    matchAccountId: {
        action: 'DescribeAccountIdFuzzyMatch',
    },
    // 获取环境列表
    getEnvList: {
        action: 'DescribeAllFundamentalEnvInfo',
        Version: '2019-01-03',
    },
    getAllEnvList: {
        action: 'DescribeAllFundamentalEnvInfo',
        Offset: 0,
        Limit: 1000,
        Version: '2019-01-03',
    },
    createEnv: {
        action: 'CreateEnvInfo',
        method: 'post',
    },
    getEnvAddrs: {
        action: 'DescribeEnvAddrByEnvId',
    },
    deleteEnv: {
        action: 'DeleteEnvInfo',
    },
    updateEnv: {
        action: 'UpdateEnvInfo',
        method: 'post',
    },
    // 获取所有成员列表
    listUsers: {
        action: 'DescribeUsers',
    },
    createUser: {
        action: 'CreateUser',
        method: 'post',
    },
    updateUser: {
        action: 'UpdateUser',
        method: 'post',
    },
    updatePwd: {
        action: 'UpdatePwd',
        method: 'post',
    },
    setUserStatus: {
        action: 'ChangeUserStatus',
    },
    // 设置、取消超管
    setUserAdmin: {
        action: 'SetSystemAdmin',
    },
    downloadTemplate: {
        action: 'GetUserImportTemplate',
        download: true,
    },
    uploadCSV: {
        action: 'CreateUserByCsvFile',
        method: 'post',
    },
    downloadResult: {
        action: 'DownloadFailUserData',
        download: true,
    },
    // 删除自定义角色
    deleteRole: {
        action: 'DeleteRole',
    },
    // 新增自定义角色
    createDefineRole: {
        action: 'CreateRole',
    },
    // 修改自定义角色
    editDefineRole: {
        action: 'UpdateRoleName',
    },
    // 权限模块
    describeModule: {
        action: 'DescribeServiceModules',
    },
    // 各个模块基础权限
    describeAllRight: {
        action: 'DescribeAllPermissions',
    },
    // 更新角色权限
    updateRoleRight: {
        action: 'UpdateRolePermissions',
        method: 'post',
    },
    // 修改用户个人信息
    updateUserInfo: {
        action: 'UpdateUserByUser',
        method: 'post',
    },
    // 删除租户或项目
    deletePermissionScope: {
        action: 'DeletePermissionScope',
        method: 'get',
    },

    // 原env.js
    getAllEnvs: {
        action: 'DescribeAllFundamentalEnvInfo',
        Offset: 0,
        Limit: 1000,
        version: '2019-01-03',
    },
    // 部署环境
    createDeployEnv: {
        action: 'CreateDeploymentEnvInfo',
        method: 'post',
        version: '2019-01-03',
    },
    updateDeployEnv: {
        action: 'UpdateDeploymentEnvInfo',
        method: 'post',
        version: '2019-01-03',
    },
    deleteDeployEnv: {
        action: 'DeleteDeploymentEnvInfo',
        version: '2019-01-03',
    },
    getDeployEnvs: {
        action: 'DescribeAllDeploymentEnvInfo',
        version: '2019-01-03',
    },
    getAllDeployEnvs: {
        action: 'DescribeAllDeploymentEnvInfo',
        Offset: 0,
        Limit: 1000,
        version: '2019-01-03',
    },
    getDeployEnvByID: {
        action: 'DescribeDeploymentEnvAddrByEnvId',
        version: '2019-01-03',
    },
    //查询用户是否第一次进入该模块
    checkVisit: {
        action: 'GetUserAccessStatus',
        version: '2019-07-11',
    },
    //更新用户进入模块状态
    updateVisitStatus: {
        action: 'UpdateUserAccessStatus',
        version: '2019-07-11'
    },
};

Object.keys(apis).forEach((key) => {
    if (!apis[key].method)
        apis[key].method = 'get';
    Object.assign(apis[key], {
        path,
    });
    !apis[key].version && Object.assign(apis[key], {
        version,
    });
});

const service = new Service(apis, prefix);

export default service;
