import Vue from 'vue';
import VueRouter from 'vue-router';
import { cloneDeep } from 'lodash';
Vue.use(VueRouter);
import App from '../index.vue';
import Login from '../views/login/index.vue';
import noAuth from '../views/login/noAuth.vue';
// import Control from 'kubecube/views/control/index.vue';
import { getItem } from 'kubecube/utils/persistant';
// import NoRight from 'kubecube/views/circle/no-right.vue';
// import wrapper from './wrapper';

// const dashboard = () => import('../home.vue');

const router = new VueRouter({
    routes: [
        {
            path: '*',
            component: App,
            name: 'top',
            // redirect: '/control',
            children: [
                {
                    path: 'login',
                    component: Login,
                    meta: {
                        noCredential: true,
                    },
                },
                {
                    path: 'noauth',
                    component: noAuth,
                    meta: {
                        noCredential: true,
                    },
                },
            ],
        },
    ],
});

// https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
const _push = router.push;
router.push = (option, onComplete, onAbort) => {
    const op = cloneDeep(option);
    if (typeof option !== 'string') {
        op.query = Object.assign({}, router.currentRoute.query, option.query);
    }
    _push.apply(router, [ op, onComplete, onAbort ]).catch(err => err);
};
const _replace = router.replace;
router.replace = (option, onComplete, onAbort, onAbort2) => {
    if (typeof option === 'string') {
        option = { path: option };
    }
    const op = cloneDeep(option);
    if (typeof onComplete === 'string' && onComplete === 'origin') {
        _replace.apply(router, [ option, onAbort, onAbort2 ]).catch(err => err);
    } else {
        op.query = Object.assign({}, router.currentRoute.query, option.query);
        console.log(op.query);
        _replace.apply(router, [ op, onComplete, onAbort ]).catch(err => err);
    }

};

router.beforeEach((to, from, next) => {
    const user = getItem('user');
    console.log(user);
    console.log('rootbefore');
    if (to.meta.loadingRequired && router.app.$store) {
        router.app.$store.set('mainLoading', true);
    }
    if (!to.meta.noCredential) {
        if (user) {
            next();
            // K8SScopeHook(to, from, next);
        } else {
            next('/login');
        }
    } else {
        if (user && to.path === '/login') {
            next('/');
        } else {
            next();
        }
    }
});

export default router;
