import { Valve, EVENTS } from './pipe';
// import { makeVModelMixin } from '../functional';
// required: request()
// require: name,
export default {
    inject: [
        'registToPipe',
        'unRegistToPipe',
    ],
    // extends: makeVModelMixin,
    data: () => ({
        model: null,
        loading: true,
        valve__: null,
    }),
    watch: {
        model() {
            this.valve__.emit(EVENTS.REQUEST_CURR_LEVEL);
        },
    },
    created() {
        this.valve__ = new Valve(this.name, this.request, this.onErrorFunc);
        this.registToPipe(this.valve__);
    },
    mounted() {
        this.$watch(() => this.valve__._controller.loading, val => {
            this.$emit('pipestatechange', val);
        });
    },
    destroyed() {
        this.unRegistToPipe(this.valve__);
    },
    methods: {
        onErrorFunc(err) { throw err; },
    },
};
