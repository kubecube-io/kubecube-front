
const state = {
    startTime: undefined,
    endTime: undefined,
    interval: '1d',
};


const getters = {

};
function calculateAutoInterval(startTime, endTime) {
    const span = endTime - startTime;
    let interval = '1d';
    if (span < 24 * 60 * 60 * 1000 * 7) {
        interval = '1h';
    }
    if (span < 60 * 60 * 1000 * 3) {
        interval = '1m';
    }
    return interval;
}
const actions = {
    setTimer({ commit }) {
        const endTime = new Date().getTime();
        const startTime = endTime - 60 * 1000 * 60;
        commit('setStartTime', startTime);
        commit('setEndTime', endTime);
    },
    setTimeRangeDefault({ commit }) {
        const endTime = new Date().getTime();
        const startTime = endTime - 60 * 1000 * 60;
        commit('setStartTime', startTime);
        commit('setEndTime', endTime);
        commit('setInterval', calculateAutoInterval(startTime, endTime));
    },
    setTimeRange({ commit }, scope) {
        commit('setStartTime', scope.startTime);
        commit('setEndTime', scope.endTime);
        commit('setInterval', calculateAutoInterval(scope.startTime, scope.endTime));
    },
    setAutoTimeRange({ commit, state }) {
        commit('setInterval', calculateAutoInterval(state.startTime, state.endTime));
    },
    setToDefault({ dispatch }) {
        dispatch('setTimeRangeDefault');
    },
};

const mutations = {

    setEndTime(state, endTime) {
        state.endTime = +endTime;
    },
    setStartTime(state, startTime) {
        state.startTime = +startTime;
    },
    setInterval(state, interval) {
        state.interval = interval;
    },
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
