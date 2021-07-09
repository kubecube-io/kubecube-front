import i18n from './i18n';
export default {
    name: 'u-form-table',
    props: {
        dynamic: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        description: { type: String },
        size: { type: String, default: 'normal' },

    },
    i18n,
    data() {
        return {
            trList: [],
            states: [],
            timeId: '',
        };
    },
    created() {
        this.$on('add-item-tr', (tr) => {
            tr.table = this;
            this.trList.push(tr);
        });
        this.$on('remove-item-tr', (tr) => {
            const index = this.trList.indexOf(tr);
            tr.table = undefined;
            this.trList.splice(index, 1);
        });
        this.$on('validate-item-tr', (tr) => {
            this.states = this.getState();
        });
        this.$on('change-item-tr', (tr) => {
            if (this.timeId)
                clearTimeout(this.timeId);

            this.timeId = setTimeout(() => {
                this.$emit('getlegal', this.states);
                clearTimeout(this.timeId);
            }, 100);
        });
    },
    methods: {
        validate(silent = false) {
            return Promise.all(this.trList.map((tr) => tr.validate('submit', silent)
                .catch((errors) => errors)
            )).then((results) => {
                if (results.some((result) => !!result))
                    throw new Error(results);
            });
        },
        addNewTr() {
            this.$emit('add');
        },
        getState() {
            const STATE_LEVEL = {
                '': 4,
                focus: 3,
                validating: 2,
                error: 1,
                success: 0,
            };
            const state = 'success';
            return this.trList.filter((tr) => !tr.ignore).map((tr) => tr.state);
        },
    },
};
