import Vue from 'vue';
import Vuex from 'vuex';
import pathify, { make } from 'vuex-pathify';
import snackbar from './snackbar';
import confirm from './confirm';
import scope from './scope';
import timer from './timer';
import lens from './lens';
import likesSuggestion from './like';
Vue.use(Vuex);
const globalState = {
    mainLoading: false,
};
const store = new Vuex.Store({
    plugins: [ pathify.plugin ],
    modules: {
        // ...remoteModules,
        snackbar,
        confirm,
        scope,
        timer,
        lens,
        likesSuggestion,
    },
    state: globalState,
    mutations: {
        ...make.mutations(globalState),
    },
    getters: {
        query(state) {
            return {
                cluster: state.scope.cluster.value,
                namespace: state.scope.namespace.value,
            };
        },
    },
});

Vue.use({
    install(_Vue) {
        _Vue.prototype.$notify = function({ content = '', color = '' }) {
            store.commit('snackbar/SHOW_MESSAGE', { content, color });
        };

        _Vue.prototype.$confirm = function({ content = '', title = '' }) {
            return store.dispatch('confirm/confirm', { content, title });
        };
    },
});

export default store;
