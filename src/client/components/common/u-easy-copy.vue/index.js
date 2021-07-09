import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);
export default {
    name: 'u-easy-copy',
    props: {
        text: { type: [String, Number], default: () => '' },
        disabled: { type: Boolean, default: false },
    },
    data() {
        return {
            copied: false,
            intervId: '',
        };
    },
    methods: {
        onCopy() {
            this.copied = true;
            if (this.intervId) {
                clearInterval(this.intervId);
            }
            this.intervId = window.setInterval(
                () => {
                    this.copied = false;
                }, 3000);
        },
    },
};
