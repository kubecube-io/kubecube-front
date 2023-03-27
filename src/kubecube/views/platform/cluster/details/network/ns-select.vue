<template>
    <el-select
        v-if="list.length > 0"
        filterable
        placeholder="请选择"
        v-bind="$attrs"
        v-model="model"
    >
        <el-option
            v-for="item in list"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
        />
    </el-select>
    <el-input
        v-else
        placeholder="暂无空间"
        disabled
    />
</template>

<script>
import { get as getFunc } from 'lodash';
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import nsService from 'kubecube/services/namespace';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        cluster: String,
    },
    data() {
        return {
            list: [],
        };
    },
    created() {
        this.getNS();
    },
    methods: {
        async getNS() {
            if (!this.cluster) {
                this.model = null;
                return;
            }
            const response = await nsService.getNamespaces({
                pathParams: {
                    cluster: this.cluster,
                },
            });
            this.list = (getFunc(response, 'items') || []).map(i => {
                const name = getFunc(i, 'metadata.name');
                return {
                    text: name,
                    value: name,
                    ...i,
                };
            });

            setValueIfListNotPresent({
                list: this.list,
                path: 'value',
                current: this.model,
            }, val => {
                this.model = getFunc(val, 'metadata.name');
            });
        },
    },

};
</script>

<style>

</style>
