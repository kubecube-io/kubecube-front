import { get } from 'lodash';
import { make } from 'vuex-pathify';
import { getItem } from 'kubecube/utils/persistant';
const state = {
    user: getItem('user') ? JSON.parse(getItem('user')) : null,
    userRole: null,
    tenant: null,
    project: null,
    cluster: null,
    namespace: null,
    loading: false,
};
let pageIdentifierCache = '';
const getters = {
    pageIdentifier: state => {
        if (state.loading === false) {
            pageIdentifierCache = `${get(state.tenant, 'value', '')}${get(state.project, 'value', '')}${get(state.cluster, 'value', '')}${get(state.namespace, 'value', '')}`;
        }
        return pageIdentifierCache;
    },
};
const actions = {
    resetState({ commit }) {
        commit('SET_USER', null);
        commit('SET_USER_ROLE', null);
        commit('SET_TENANT', null);
        commit('SET_PROJECT', null);
        commit('SET_CLUSTER', null);
        commit('SET_NAMESPACE', null);
        commit('SET_LOADING', false);
    },
};
const mutations = {
    ...make.mutations(state),
};
console.log(mutations);
export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions,
};
