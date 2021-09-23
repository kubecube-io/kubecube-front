import Platform from 'kubecube/views/platform/index.vue';
import wrapper from './wrapper';
export default {
    path: 'platform',
    name: 'platform',
    component: Platform,
    meta: {
        credential: true,
    },
    children: [
        {
            path: 'user',
            component: wrapper,
            redirect: { name: 'platform.user' },
            meta: {
                breadCrumb: '用户管理',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.user',
                    component: () => import(/* webpackChunkName: "platform-user" */'kubecube/views/platform/user/index.vue'),
                    meta: {
                        breadCrumb: '用户列表',
                    },
                },

            ],
        },
        {
            path: 'role',
            // redirect: { name: 'platform.user' },
            component: () => import(/* webpackChunkName: "platform-user" */'kubecube/views/platform/role/index.vue'),
            meta: {
                breadCrumb: '角色管理',
            },
            children: [
                {
                    path: ':identity',
                    name: 'platform.role.manage',
                    component: () => import(/* webpackChunkName: "platform-user" */'kubecube/views/platform/role/roles.vue'),
                    meta: {
                        breadCrumb(name) {
                            switch (name) {
                                case 'platform':
                                    return '平台角色';
                                case 'tenant':
                                    return '租户角色';
                                case 'project':
                                    return '项目角色';
                                default:
                                    return '';
                            }
                        },
                    },
                },

            ],
        },
        {
            path: 'tenant',
            component: () => import(/* webpackChunkName: "platform-tenant" */'kubecube/views/platform/tenant/tabs.vue'),
            redirect: { name: 'platform.tenant' },
            meta: {
                breadCrumb: '租户管理',
            },
            children: [
                {
                    path: 'tenant',
                    name: 'platform.tenant',
                    component: () => import(/* webpackChunkName: "platform-tenant" */'kubecube/views/platform/tenant/tenant.vue'),
                    meta: {
                        breadCrumb: '租户列表',
                    },
                },
                {
                    path: 'project',
                    name: 'platform.project',
                    component: () => import(/* webpackChunkName: "platform-tenant" */'kubecube/views/platform/tenant/project.vue'),
                    meta: {
                        breadCrumb: '项目列表',
                    },
                },
                {
                    path: 'member',
                    name: 'platform.member',
                    component: () => import(/* webpackChunkName: "platform-tenant" */'kubecube/views/platform/tenant/member.vue'),
                    meta: {
                        breadCrumb: '成员列表',
                    },
                },
            ],
        },
        {
            path: 'quota',
            component: () => import(/* webpackChunkName: "platform-quota" */'kubecube/views/platform/quota/index.vue'),
            meta: {
                breadCrumb: '租户配额',
            },
        },
        {
            path: 'nsquota',
            component: () => import(/* webpackChunkName: "platform-quota" */'kubecube/views/platform/namespace/index.vue'),
            meta: {
                breadCrumb: '空间管理',
            },
        },
        {
            path: 'audit',
            component: () => import(/* webpackChunkName: "platform-audit" */'kubecube/views/platform/audit/index.vue'),
            meta: {
                breadCrumb: '操作审计',
            },
        },
        {
            path: 'bootstrap',
            component: () => import(/* webpackChunkName: "platform-bootstrap" */ 'kubecube/views/platform/bootstrap/quick-boot.vue'),
            meta: {
                breadCrumb: '快速向导',
            },
        },
        {
            path: 'cluster',
            component: wrapper,
            redirect: { name: 'platform.cluster.list' },
            meta: {
                breadCrumb: '集群管理',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.cluster.list',
                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/index.vue'),
                    meta: {
                        breadCrumb: '集群列表',
                    },
                },
                {
                    path: ':name',
                    name: 'platform.cluster.detail',
                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/detail.vue'),
                    redirect: { name: 'platform.cluster.detail.info' },
                    meta: {
                        breadCrumb: route => {
                            // console.log(route);
                            return route;
                        },
                    },
                    children: [
                        {
                            path: 'info',
                            name: 'platform.cluster.detail.info',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/details/info.vue'),
                            meta: {
                                breadCrumb: '详情',
                            },
                        },
                        {
                            path: 'node',
                            name: 'platform.cluster.detail.node',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/details/node.vue'),
                            meta: {
                                breadCrumb: '节点',
                            },
                        },
                        {
                            path: 'storageclass',
                            name: 'platform.cluster.detail.storageclass',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/details/storageclass.vue'),
                            meta: {
                                breadCrumb: '存储类别',
                            },
                        },
                        {
                            path: 'persistentvolumes',
                            name: 'platform.cluster.detail.persistentvolumes',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/details/persistentvolumes.vue'),
                            meta: {
                                breadCrumb: '持久存储',
                            },
                        },
                        {
                            path: 'network',
                            name: 'platform.cluster.detail.network',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/details/network/index.vue'),
                            meta: {
                                breadCrumb: '网络策略',
                            },
                            children: [
                                {
                                    path: 'create',
                                    name: 'platform.cluster.detail.network.create',
                                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/details/network/edit.vue'),
                                    meta: {
                                        breadCrumb: '创建网络策略',
                                        type: 'create',
                                    },
                                },
                                {
                                    path: 'edit/:namespace/:instance',
                                    name: 'platform.cluster.detail.network.edit',
                                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubecube/views/platform/cluster/details/network/edit.vue'),
                                    meta: {
                                        breadCrumb(name, list) { return `修改网络策略: ${list[5]}`; },
                                        type: 'edit',
                                    },
                                },
                            ],
                        },
                        {
                            path: 'monitor',
                            name: 'platform.cluster.detail.monitor',
                            component: () => /* webpackChunkName: "platform-cluster" */ import('kubecube/views/control/monitor/monitor.vue'),
                            meta: {
                                breadCrumb: '监控',
                                resource: 'cube-resource-cluster',
                            },
                        },
                        {
                            path: ':nodename',
                            name: 'platform.cluster.nodedetail',
                            component: () => /* webpackChunkName: "platform-cluster" */ import('kubecube/views/platform/cluster/node/index.vue'),
                            redirect: { name: 'platform.cluster.nodedetail.info' },
                            meta: {
                                breadCrumb(name) { return `Pod: ${name}`; },
                                breadDisabled: true,
                            },
                            children: [
                                {
                                    path: 'info',
                                    name: 'platform.cluster.nodedetail.info',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubecube/views/platform/cluster/node/info.vue'),
                                    meta: {
                                        breadCrumb: '节点详情',
                                    },
                                },
                                {
                                    path: 'pod',
                                    name: 'platform.cluster.nodedetail.pod',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubecube/views/platform/cluster/node/pod.vue'),
                                    meta: {
                                        breadCrumb: '副本',
                                    },
                                },
                                {
                                    path: 'monitor',
                                    name: 'platform.cluster.nodedetail.monitor',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubecube/views/control/monitor/monitor.vue'),
                                    meta: {
                                        breadCrumb: '监控',
                                        resource: 'cube-resource-node',
                                    },
                                },
                                {
                                    path: 'event',
                                    name: 'platform.cluster.nodedetail.event',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubecube/views/platform/cluster/node/event.vue'),
                                    meta: {
                                        breadCrumb: '事件',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            path: 'monitor',
            name: 'platform.monitor',
            redirect: { name: 'platform.monitor.list' },
            component: wrapper,
            meta: {
                breadCrumb: '组件监控',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.monitor.list',
                    component: () => /* webpackChunkName: "platform-observable" */ import('kubecube/views/platform/observable/monitor.vue'),
                    meta: {
                        subroot: true,
                    },
                },
                {
                    path: ':dashboard',
                    name: 'platform.monitor.dashboard',
                    component: () => /* webpackChunkName: "platform-observable" */ import('kubecube/views/platform/observable/monitor.js'),
                    meta: {
                        breadCrumb(name) { return name; },
                    },
                },
            ],
        },
        {
            path: 'PrometheusRule',
            name: 'platform.PrometheusRule',
            component: wrapper,
            redirect: { name: 'platform.PrometheusRule.list' },
            meta: {
                breadCrumb: '告警规则',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.PrometheusRule.list',
                    component: () => /* webpackChunkName: "platform-observable" */ import('kubecube/views/platform/observable/prometheus-rule.vue'),
                    meta: {
                        subroot: true,
                    },
                },
                {
                    path: ':cluster',
                    component: wrapper,
                    meta: {
                        skip: true,
                    },
                    children: [
                        {
                            path: 'create',
                            name: 'platform.PrometheusRule.create',
                            component: () => /* webpackChunkName: "platform-observable" */ import('kubecube/views/platform/observable/prometheus-rule-edit.vue'),
                            meta: {
                                breadCrumb: '创建',
                                type: 'create',
                            },
                        },
                        {
                            path: ':instance',
                            component: () => /* webpackChunkName: "platform-observable" */ import('kubecube/views/platform/observable/prometheus-rule-instance.vue'),
                            meta: {
                                breadCrumb(name) { return name; },
                                breadDisabled: true,
                            },
                            children: [
                                {
                                    path: 'edit',
                                    component: () => /* webpackChunkName: "platform-observable" */ import('kubecube/views/platform/observable/prometheus-rule-edit.vue'),
                                    meta: {
                                        breadCrumb: '编辑',
                                        type: 'edit',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            path: 'AlertmanagerConfig',
            name: 'platform.AlertmanagerConfig',
            component: () => /* webpackChunkName: "platform-observable" */ import('kubecube/views/platform/observable/alertmanager-config.vue'),
            meta: {
                breadCrumb: '全局告警配置',
            },
        },
    ],
};
