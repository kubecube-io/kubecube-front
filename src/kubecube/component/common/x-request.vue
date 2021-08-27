<template>
  <component :is="component">
    <slot
      :data="data"
      :error="error"
      :loading="loading"
      :errormessage="errormessage"
    />
  </component>
</template>

<script>
import { isFunction } from 'lodash';
export default {
    name: 'XRequest',
    props: {
        // parallel | waterfall
        mode: {
            type: String,
            default: 'parallel',
        },
        params: [ Object, Array ],
        preprocessor: {
            type: Function,
            default: () => true,
        },
        processor: {
            type: Function,
            default: a => a,
        },
        service: [ Function, Array ],
        component: {
            type: [ String, Object ],
            default: 'div',
        },
        poll: [ Boolean, Object ],
        // waterfall 必传
        paramResolver: Function,
    },
    data() {
        return {
            loading: false,
            error: false,
            data: null,
            errormessage: null,
            // currentRequest: null,
        };
    },
    watch: {
        poll(val) {
            if (!val && this.currtimeout) {
                clearTimeout(this.currtimeout);
            } else {
                this.request();
            }
        },
    },
    created() {
        this.request();
    },
    mounted() {
        const watcher = (oldvalue, newvalue) => {
            const a = JSON.stringify(oldvalue);
            const b = JSON.stringify(newvalue);
            // console.log(a);
            // console.log(b);
            if (a !== b) {
                this.request();
            }

        };
        this.$watch(() => this.params, watcher, {
            deep: true,
        });
    },
    destroyed() {
        if (this.currtimeout) {
            clearTimeout(this.currtimeout);
        }
    },
    methods: {
        resetData() {
            this.data = null;
        },
        request(reload) {
            if (!this.preprocessor()) return;
            if (!reload) {
                this.loading = true;
            }
            this.error = false;
            this.errormessage = null;
            const service = this.service;
            let currentRequest;
            if (Array.isArray(this.params)) {
                if (this.mode === 'parallel') {
                    currentRequest = this.parallelReq();
                }
                if (this.mode === 'waterfall') {
                    currentRequest = this.waterfallReq();
                }
            } else {
                currentRequest = service(this.params).then(data => {
                    this.data = this.processor(data);
                }).catch(err => {
                    console.log(err);
                    this.errormessage = err;
                    this.error = true;
                })
                    .finally(() => {
                        this.loading = false;
                    });
            }
            this.currentRequest = currentRequest;

            if (this.poll) {
                const interval = this.poll.interval;
                if (this.currtimeout) {
                    clearTimeout(this.currtimeout);
                }
                this.currtimeout = setTimeout(() => {
                    this.request();
                }, interval);
                // map.set(this, setTimeout(() => {
                //     this.request(true);
                // }, interval));
                // if (!this.currentRequest) {
                //     this.currentRequest = setTimeout(() => {
                //         this.currentRequest = null;
                //         this.request(true);

                //     }, interval);
                // }
            }

            return this.currentRequest;
        },
        parallelReq() {
            const service = this.service;
            return Promise.all(this.params.map(p => service(p).catch(err => { console.log(err); return []; })))
                .then(result => {
                    this.data = this.processor(result);
                }).catch(err => {
                    this.errormessage = err;
                    this.error = true;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        waterfallReq() {
            const service = this.service;
            const paramResolver = this.paramResolver;

            let index = 0;
            const results = [];
            const accuParams = {};
            const variable = this.params[index];
            let lastVariable = null;
            let lastResult = null;
            let res;
            let rej;
            const promise = new Promise((resolve, reject) => {
                res = resolve;
                rej = reject;
            });
            const request = v => {
                const nextParam = paramResolver(v, lastVariable, lastResult, accuParams, index);
                const s = isFunction(service) ? service : service[index];
                s(nextParam).then(result => {
                    results.push({
                        currParam: v,
                        result,
                    });
                    index += 1;
                    lastVariable = v;
                    lastResult = result;
                    v = this.params[index];
                    if (!v) {
                        this.data = results;
                        this.loading = false;
                        res();
                        return;
                    }

                    request(v);
                }).catch(err => {
                    this.errormessage = err;
                    this.error = true;
                    rej();
                });
            };
            request(variable, null);
            return promise;
        },
    },
};
</script>

<style>

</style>
