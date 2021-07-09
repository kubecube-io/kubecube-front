import Vue from 'vue';
import store from '../store';
const CONFIRM_ROUTE_NAMES = [
    'deployment.edit',
    'deployment.updateImage',
    'statefulset.edit',
    'job.edit',
    'service.edit',
    'ingress.edit',
    'secret.edit',
    'configmap.edit',
    'helm.public.edit',
    'helm.private.edit',
    'repo.private.index.policy.edit' ];

export function needConfirm(pathName) {
    return CONFIRM_ROUTE_NAMES.includes(pathName);
}

const defaultConfirm = {
    title: '提示',
    content: '确认离开本页吗？',
    subContent: '离开后本页所编辑的信息将被清空',
};

export function getLeaveConfirm(route) {
    if (store.state.scope && store.state.scope.confirmed) {
        store.commit('scope/setConfirmed', false);
        return undefined;
    }
    if (!route) { return undefined; }
    const meta = route.meta;
    return meta.leaveConfirm === true ? defaultConfirm : meta.leaveConfirm;
}

export function confirmPromise(leaveConfirm) {
    return new Promise(resolve => {
        Vue.$confirm(Object.assign({}, leaveConfirm, {
            ok: () => Promise.resolve().then(() => {
                store.commit('scope/setConfirmed', true);
                resolve(true);
            }),
            cancel: () => {
                resolve(false);
            },
        }));
    });
}
