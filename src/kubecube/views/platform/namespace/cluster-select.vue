<template>
  <u-select
    v-if="list.length > 0"
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
            const response = await clusterService.getClusters();
            this.list = (getFunc(response, 'items') || []).map(i => ({
                text: i.clusterName,
                value: i.clusterName,
                ...i,
            }));

            setValueIfListNotPresent({
                list: this.list,
                path: 'value',
                current: getFunc(this.model, 'value'),
            }, val => {
                this.modelValue = getFunc(val, 'value');
            });
        },
    },

};
</script>

<style>

</style>
