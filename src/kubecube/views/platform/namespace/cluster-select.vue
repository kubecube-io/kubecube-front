<template>
  <u-loading
    v-if="loading"
    size="small"
  />
  <u-select
    v-else-if="list.length > 0"
    v-model="modelValue"
    :data="list"
    v-bind="$attrs"
  />
  <u-select
    v-else
    v-bind="$attrs"
    value="暂无集群"
    disabled
  />
</template>

<script>
import { get as getFunc } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import clusterService from 'kubecube/services/cluster';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            list: [],
            loading: false,
        };
    },
    computed: {
        modelValue: {
            get() {
                return getFunc(this.model, 'value', null);
            },
            set(val) {
                this.model = this.list.find(m => m.value === val);
            },
        },
    },
    created() {
        this.getClusters();
    },
    methods: {
        async getClusters() {
            this.loading = true;
            const response = await clusterService.getClusters({
                params: {
                    // status: 'normal',
                },
            });
            this.list = (getFunc(response, 'items') || []).map(i => ({
                text: i.clusterName,
                value: i.clusterName,
                ...i,
                disabled: i.status !== 'normal',
            }));

            setValueIfListNotPresent({
                list: this.list.filter(i => !i.disabled),
                path: 'value',
                current: getFunc(this.model, 'value'),
            }, val => {
                this.modelValue = getFunc(val, 'value');
            });
            this.loading = false;
        },
    },

};
</script>

<style>

</style>
