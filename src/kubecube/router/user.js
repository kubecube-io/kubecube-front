
export default {
    path: 'metauser',
    name: 'metauser',
    component: () => import(/* webpackChunkName: "user-chunk" */'kubecube/views/user/index.vue'),
    redirect: { name: 'metauser.openapi' },
    children: [
        {
            path: 'openapi',
            name: 'metauser.openapi',
            component: () => import(/* webpackChunkName: "user-chunk" */'kubecube/views/user/open-api.vue'),
            meta: {
                breadCrumb: '秘钥管理',
            },
        },

    ],
};
