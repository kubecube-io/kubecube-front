import { Pipe } from './pipe';

// required: graph
export default {
    data: () => ({
        pipe__: null,
    }),
    created() {
        this.pipe__ = new Pipe(this.graph);
    },
    mounted() {
        this.$watch(() => this.pipe__.loading, val => {
            this.$emit('pipestatechange', val);
        });
        // this.pipe__.request();
    },
    provide() {
        return {
            registToPipe: this._registToPipe,
            unRegistToPipe: this._unRegistToPipe,
        };
    },
    methods: {
        pipeRequest() {
            this.pipe__.request();
        },
        _registToPipe(valve) {
            this.pipe__.registValve(valve);
        },
        _unRegistToPipe(valve) {
            this.pipe__.unregistValve(valve);
        },
    },
};
