let uid = 0;
import { make } from 'vuex-pathify';
const state = {
    loading: false,
    query: '',
    filters: [],
    task: '',
    kind: 'container',
    tablesort: 'asc',
};


const getters = {
    enabledFilters: state => {
        return state.filters.filter(({ disable }) => !disable);
    },
};

const actions = {
    setToDefault({ commit }) {
        commit('removeAllFilter');
        commit('setTask', 'all');
        commit('setKind', 'container');
        commit('setQuery', '');
        commit('setTableSort', 'asc');
    },
};

const mutations = {
    ...make.mutations(state),
    setFilters(state, filters) {
        if (JSON.stringify(state.filters) !== JSON.stringify(filters)) {
            state.filters = filters.map(f => ({
                ...f,
                uid: uid++,
            }));
        }
    },
    setTask(state, task) {
        state.task = task;
    },
    setQuery(state, query) {
        state.query = query;
    },
    changeFilter(state, { index, filter }) {
        state.filters.splice(index, 1, filter);
    },
    removeFilter(state, index) {
        state.filters.splice(index, 1);
    },
    removeAllFilter(state) {
        state.filters = [];
    },
    addFilter(state, filter) {
        state.filters.push({
            ...filter,
            uid: uid++,
        });
    },
    setTableSort(state, sort) {
        state.tablesort = sort;
    },
    setKind(state, kind) {
        state.kind = kind;
    },
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
