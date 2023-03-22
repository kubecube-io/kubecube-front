import { upperFirst } from 'lodash';
import wrapper from './wrapper';

export default {
    path: 'control',
    name: 'control',
    redirect: { name: 'control.dashboard' },
    component: () => import(/* webpackChunkName: "control-common" */'kubecube/views/control/index.vue'),
    children: [
        {
            path: 'dashboard',
            name: 'control.dashboard',
            component: () => /* webpackChunkName: "control-workload" */ import('kubecube/views/control/monitor/monitor.vue'),
            meta: {
                breadCrumb: '资源监控',
                resource: 'cube-resource-namespace',
            },
        },
        {
            path: 'lens/:type',
            name: 'control.lens',
            component: () => import(/* webpackChunkName: "control-lens" */'kubecube/views/control/logseer/lens/index.vue'),
            meta: {
                breadCrumb(name, relative) {
                    const type = relative[1];
                    let p;
                    if (type === 'normal') {
                        p = '搜索';
                    }
                    if (type === 'stream') {
                        p = '实时流';
                    }
                    if (type === 'trace') {
                        p = '全链路搜索';
                    }
                    return `日志查询 ${p}模式`;
                },
            },
        },
        {
            path: 'bootstrap',
            name: 'control.bootstrap',
            component: () => import(/* webpackChunkName: "control-common" */'kubecube/views/control/bootstrap/index.vue'),
            meta: {
                breadCrumb: '常用工具',
            },
        },
        {
            path: 'crd',
            name: 'crd',
            component: () => import(/* webpackChunkName: "control-crd" */'kubecube/views/control/crd/index.vue'),
            redirect: { path: '/control/crd/Cluster' },
            meta: {
                breadCrumb: '自定义资源',
            },
            children: [
                {
                    path: ':level',
                    name: 'crd.list',
                    component: () => import(/* webpackChunkName: "control-crd" */'kubecube/views/control/crd/list.vue'),
                    meta: {
                        breadCrumb(name) {
                            return `${name === 'Cluster' ? '集群' : '空间'} 级别`;
                        },
                    },
                    children: [
                        {
                            path: ':name/:version',
                            name: 'crd.detail',
                            component: () => import(/* webpackChunkName: "control-crd" */'kubecube/views/control/crd/detail.vue'),
                            meta: {
                                breadCrumb(name, list) {
                                    return `${list[2]} ${list[3]}`;
                                },
                            },
                        },
                    ],
                },

                // {
                //     path: 'detail/:level/:name/:version',
                //     component: () => import(/* webpackChunkName: "control-crd" */'./detail.vue'),
                //     children: [
                //         {
                //             path: 'instances',
                //             component: () => import(/* webpackChunkName: "control-crd" */'./instances.vue'),
                //         }
                //     ],
                // }
            ],
        },
        {
            path: ':workload',
            name: 'control.workload',
            component: wrapper,
            redirect: { name: 'control.workload.list' },
            meta: {
                breadCrumb(name) {
                    console.log(name);
                    switch (name) {
                        case 'logconfigs':
                            return '日志任务管理';
                        case 'persistentvolumeclaims':
                            return 'PersistentVolumeClaims';
                        case 'AlertmanagerConfig':
                            return '告警策略组';
                        case 'PrometheusRule':
                            return '告警规则';
                        default:
                            return upperFirst(name);
                    }

                },
            },
            children: [
                {
                    path: 'list',
                    name: 'control.workload.list',
                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/list.js'),
                    meta: {
                        subroot: true,
                    },
                },
                {
                    path: 'create',
                    name: 'control.workload.create',
                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/edit.js'),
                    meta: {
                        breadCrumb: '创建',
                        type: 'create',
                    },
                },
                {
                    path: ':instance',
                    redirect: { name: 'control.workload.info' },
                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/index.vue'),
                    meta: {
                        breadDisabled(name, arr) {
                            return arr[0] === 'PrometheusRule';
                        },
                        breadCrumb(name) { return name; },
                    },
                    children: [
                        {
                            path: 'updateImage',
                            name: 'control.workload.updateImage',
                            component: () => /* webpackChunkName: "kubecube-control" */ import('../views/control/workload/dp/updateImage.vue'),
                            meta: {
                                breadCrumb: '滚动更新',
                            },
                        },
                        {
                            path: 'edit',
                            name: 'control.workload.edit',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/edit.js'),
                            meta: {
                                breadCrumb: '编辑',
                                type: 'edit',
                            },
                        },
                        {
                            path: 'info',
                            name: 'control.workload.info',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/info.js'),
                            meta: {
                                breadCrumb: '基本信息',
                            },
                        },
                        {
                            path: 'pod',
                            name: 'control.workload.pod',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/pod.vue'),
                            meta: {
                                breadCrumb: '副本',
                            },
                        },
                        {
                            path: 'monitor',
                            name: 'control.workload.monitor',
                            component: () => /* webpackChunkName: "control-workload" */ import('kubecube/views/control/monitor/monitor.vue'),
                            meta: {
                                breadCrumb: '监控',
                            },
                        },
                        {
                            path: 'jobs',
                            name: 'control.workload.jobs',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/jobs.vue'),
                            meta: {
                                breadCrumb: '任务列表',
                            },
                        },
                        {
                            path: 'event',
                            name: 'control.workload.event',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/event.vue'),
                            meta: {
                                breadCrumb: '事件',
                            },
                        },
                        {
                            path: 'condition',
                            name: 'control.workload.condition',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/condition.vue'),
                            meta: {
                                breadCrumb: 'condition信息',
                            },
                        },
                        {
                            path: 'log',
                            name: 'control.workload.log',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/log.vue'),
                            meta: {
                                breadCrumb: '日志',
                            },
                        },
                        {
                            path: 'extrnal',
                            name: 'control.workload.external',
                            component: () => /* webpackChunkName: "control-workload" */ import('kubecube/views/control/service/detail/external.vue'),
                            meta: {
                                breadCrumb: '对外服务端口',
                            },
                        },
                        {
                            path: ':pod',
                            component: wrapper,
                            redirect: { name: 'control.workload.containerdetail' },
                            meta: {
                                breadCrumb(name) { return name; },
                                breadDisabled: true,
                            },
                            children: [
                                {
                                    path: ':container',
                                    name: 'control.workload.containerdetail',
                                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/container-detail.vue'),
                                    meta: {
                                        breadCrumb(name) { return name; },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
