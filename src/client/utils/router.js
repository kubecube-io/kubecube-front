/**
 * vue-router路由劫持
 * @param {*} router
 */
export function customRouter(router) {
    function getLeaveConfirm(to) {
        if (!to)
            return undefined;
        const meta = to.meta;
        return meta.leaveConfirm === true ? router.defaultConfirm : meta.leaveConfirm;
    }
    function getRefreshBase(to) {
        let refreshBase = '';
        for (const item of to.matched) {
            const meta = item.meta;
            if (meta.refreshBase !== undefined) {
                refreshBase = meta.refreshBase === true ? item.path : meta.refreshBase;
            }
        }
        if (typeof refreshBase === 'string')
            refreshBase = { path: refreshBase };
        return refreshBase;
    }
    function getValueStr(value) {
        if (typeof value === 'string')
            return value;
        else
            return JSON.stringify(value);
    }
    router.defaultConfirm = {
        title: '提示',
        content: '确认离开本页吗？',
        subContent: '离开后本页所编辑的信息将被清空',
    };
    // 同路径是否刷新，需要监听的固定参数，各个模块根据自己的项目的需要覆盖或者增加
    router.compareQuerys = ['projectId'];
    router.compareCallBack = () => ({});
    // 因为在编辑页面需要弹窗确认，改变租户会先后引发两次beforeEach(tenantId和连锁反应的projectId)，会出现两次弹窗
    // 所以这里设置一个开关needConfirm，默认为true，在编辑页面租户改动时，置为false，在u-head.vue中的tenantId和projectId都改变好后。还原为true.
    router.needConfirm = true;
    let isChecked = false;
    let forceRefresh = false;
    let hiddenConfirm = false;
    router.beforeEach((to, from, next) => {
        const leaveConfirm = getLeaveConfirm(from);
        function nextRouter() {
            let refreshPage = false;
            let newParams = to.query;
            // 不等同路径不做同页面刷新，不等path页面的跳转不视为切换
            if (from.path !== to.path || isChecked) {
                if (from.path !== to.path && isChecked)
                    forceRefresh = false;
                next();
                return;
            }
            for (const key of router.compareQuerys) {
                const value = to.query[key];
                const oldValue = from.query[key];
                if (getValueStr(value) !== getValueStr(oldValue)) {
                    const paramAdd = router.compareCallBack(to, from);
                    newParams = Object.assign({}, newParams, paramAdd);
                    refreshPage = true;
                }
            }
            if (refreshPage) {
                let { path, extraQuery } = getRefreshBase(to);
                let query = {};
                if (!path || path === to.path) {
                    path = to.path;
                    query = to.query;
                } else {
                    for (const key of router.compareQuerys) {
                        query[key] = to.query[key];
                    }
                }
                forceRefresh = true;
                isChecked = true;
                next({
                    path,
                    query: Object.assign({}, extraQuery, query),
                });
            } else
                next();
        }
        if (leaveConfirm && !hiddenConfirm && router.needConfirm) {
            hiddenConfirm = true;
            router.app.$confirm(Object.assign({}, leaveConfirm, {
                ok: () => Promise.resolve().then(() => {
                    if (router.onOk instanceof Function) {
                        router.onOk(to.query);
                        router.onCancel = undefined;
                        router.onOk = undefined;
                    }
                    nextRouter();
                }),
                cancel: () => {
                    if (router.onCancel instanceof Function) {
                        router.onCancel(to.query);
                        router.onCancel = undefined;
                        router.onOk = undefined;
                    }
                    hiddenConfirm = false;
                },
            }));
        } else {
            if (router.onOk instanceof Function) {
                router.onOk(to.query);
                router.onCancel = undefined;
                router.onOk = undefined;
            }
            nextRouter();
        }
    });
    router.afterEach((to, from) => {
        hiddenConfirm = false;
        isChecked = false;
        if (forceRefresh) {
            setTimeout(() => {
                router.refresh(to, from);
            }, 50);
            forceRefresh = false;
        }
    });
    const _push = router.push;
    router.push = (option, onComplete, onAbort) => {
        hiddenConfirm = option instanceof Object ? option.noConfirm : false;
        _push.apply(router, [option, onComplete, onAbort]);
    };
    router.refresh = () => {
        // refresh需要组件复写，外部自行决定需要刷新的部分
        window.location.reload();
    };
}
