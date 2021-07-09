import { keys } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
    },
    inject: {
        allResource: 'resources',
    },
    computed: {
        resources() {
            return this.allResource[this.resource];
        },
    },
    methods: {
        getKeys(value) {
            if (!value || !this.resources) return [];
            const p = this.resources.find(r => r.value === value);
            if (!p) return [];
            return keys(p.data).map(k => ({
                text: k,
                value: k,
            }));
        },
    },
};
