import { make } from 'vuex-pathify';
const state = {
    title: '',
    content: '',
    visible: false,
};
let p = null;
const actions = {
    async confirm({ commit }, options) {
        commit('SHOW_CONFIRM', options);
        return new Promise(resolve => {
            p = resolve;
        });
    },

    confirmResult({ commit }, result) {
        commit('SET_VISIBLE', false);
        if (p) p(result);
    },
};

const mutations = {
    SHOW_CONFIRM(state, options) {
        state.content = options.content || '';
        state.title = options.title || '';
        state.visible = true;
    },
    ...make.mutations(state),
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
