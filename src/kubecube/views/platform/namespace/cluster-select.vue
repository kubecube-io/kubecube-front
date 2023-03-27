<template>
    <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
    <el-select
        v-else-if="list.length > 0"
        v-bind="$attrs"
        v-model="modelValue"
    >
        <el-option
            v-for="optionItem in (list || [])"
            :key="optionItem.value"
            :label="optionItem.text"
            :value="optionItem.value">
        </el-option>
    </el-select>
    <el-input
        v-else
        v-bind="$attrs"
        placeholder="暂无集群"
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
                    prune: true,
                },
            });
            this.list = (getFunc(response, 'items') || []).map(i => ({
                text: getFunc(i, 'annotations["cluster.kubecube.io/cn-name"]', i.clusterName),
                value: i.clusterName,
                ...i,
                disabled: i.status !== 'normal',
            }));
            console.log(this.list);

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
