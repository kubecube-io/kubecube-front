export default {
    // systemMgr: ['/permission/platformManage/tenant', '/permission/platformManage/audit', '/permission/platformManage/outerAuth'],
    // tenantMgr: ['/permission/tenantManage/project', '/permission/tenantManage/member'],
    // projectMgr: ['/permission/projectManage/projectP'],

    tenantMgr: ['/permission/tenantManage/**'],
    projectMgr: ['/permission/projectManage/**'],
    opsMgr: ['/permission/platformManage/**'],
    // userMgr: ['/permission/userManage/**', '!/permission/userManage/right/feature'], // ! 排除法 🌰 栗子
    userMgr: ['/permission/userManage/**'],
    actionTrail: ['/permission/auditManage/**'],
};
