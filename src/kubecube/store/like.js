import logseerService from 'kubecube/services/logseer';
import { cloneDeep } from 'lodash';
const maxShow = 6;
const state = {
    suggestions: [],
    selected: [],
    remains: [],
    loading: false,
    showLikesPopper: false,
};
// function sortSelected(selected) {
//     if (selected.includes('message')) {
//         selected.splice(selected.findIndex('message'), 1);
//         selected.unshift('message');
//     }
//     return selected;
// }
const order = [
    'message',
    'hostname',
    'namespace',
    'cluster_name',
    'pod_name',
    'container_name',
    'workload_name',
    'agent.hostname',
    'agent.ephemeral_id',
];
const sortFields = fields => {
    const sorted = [];
    order.forEach(f => {
        const i = fields.findIndex(t => f === t);
        if (i !== -1) {
            sorted.push(f);
            fields.splice(i, 1);
        }
    });

    return sorted.concat(fields);
};

// const chooseAndSort = availableFields => {
//     const getSelected = () => {
//         if (availableFields.includes('message')) {
//             return [ 'message' ];
//         }
//         return [];
//     };
//     const getRemained = () => {
//         let p = cloneDeep(availableFields);
//         if (availableFields.includes('message')) {
//             p = p.filter(i => i !== 'message');
//         }
//         return sortFields(p);
//     };
//     return type => {
//         if (type === 'selected') return getSelected();
//         if (type === 'remains') return getRemained();
//     };
// };

const getters = {

};

const actions = {
    refreshSuggestions({ commit, rootState }) {
        commit('RESET');
        commit('SET_LOADING', true);
        const type = rootState.lens.kind === 'host' ? 'host' : 'container';
        logseerService.availableFields({ query: { type } }).then(({ availableFields }) => {
            let p = cloneDeep(availableFields);
            if (availableFields.includes('message')) {
                p = p.filter(i => i !== 'message');
            }
            commit('SET_SUGGESTIONS', cloneDeep(p));
            commit('SET_SELECTED', []);
            commit('SET_REMAINS', cloneDeep(p));
        }).finally(() => {
            commit('SET_LOADING', false);
        });
    },
    addToSelected({ commit, state }, target) {
        const {
            selected, remains,
        } = state;
        const idx = remains.findIndex(r => target === r);
        if (idx !== -1) {
            commit('REMOVE_REMAINS', idx);
            if (selected.length === maxShow) {
                const target = selected[maxShow - 1];
                commit('REMOVE_SELECTED', maxShow - 1);
                commit('ADD_TO_REMAINS', target);
            }
            commit('ADD_TO_SELECTED', target);
        }
    },
    removeSelected({ commit, state }, target) {
        const {
            selected,
        } = state;
        const idx = selected.findIndex(r => target === r);
        if (idx !== -1) {
            commit('REMOVE_SELECTED', idx);
            commit('ADD_TO_REMAINS', target);
        }
    },

    addToSelectedList({ commit, state }, targets) {
        console.log(targets);
        const selected = state.selected.concat(targets);
        const remains = state.remains.filter(r => !targets.includes(r));
        console.log(selected, remains);
        commit('SET_SELECTED', selected);
        commit('SET_REMAINS', remains);
    },
    removeListSelected({ commit, state }, targets) {
        const remains = state.remains.concat(targets);
        const selected = state.selected.filter(r => !targets.includes(r));
        commit('SET_SELECTED', selected);
        commit('SET_REMAINS', remains);
    },
    clearSelected({ commit, state }) {
        commit('SET_SELECTED', []);
        console.log(state.suggestions);
        commit('SET_REMAINS', cloneDeep(state.suggestions));
    },
    selectAll({ commit, state }) {
        commit('SET_SELECTED', cloneDeep(state.suggestions));
        commit('SET_REMAINS', []);
    },
};

const mutations = {
    RESET(state) {
        Object.assign(state, {
            suggestions: [],
            selected: [],
            remains: [],
            showLikesPopper: false,
        });
    },
    SET_LOADING(state, loading) {
        state.loading = loading;
    },
    SET_SHOW_LIKES_POPPER(state, popper) {
        state.showLikesPopper = popper;
    },
    SET_SELECTED(state, list) {
        state.selected = sortFields(list);
    },
    SET_REMAINS(state, list) {
        state.remains = sortFields(list);
    },
    SET_SUGGESTIONS(state, list) {
        state.suggestions = list;
    },
    REMOVE_SELECTED(state, idx) {
        return state.selected.splice(idx, 1);
    },
    ADD_TO_SELECTED(state, target) {
        state.selected = sortFields([ ...state.selected, target ]);
    },
    REMOVE_REMAINS(state, idx) {
        state.remains.splice(idx, 1);
    },
    ADD_TO_REMAINS(state, target) {
        state.remains = sortFields([ ...state.remains, target ]);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
