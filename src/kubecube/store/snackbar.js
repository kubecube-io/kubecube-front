const state = {
    content: '',
    color: '',
};
const mutations = {
    SHOW_MESSAGE(state, message) {
        state.content = message.content || '';
        state.color = message.color || '';
    },
};

export default {
    namespaced: true,
    state,
    mutations,
};
