<template>
  <x-request
    ref="request"
    :service="service"
    :params="requestParam"
    :processor="resolver"
  >
    <template slot-scope="{ data, loading }">
      <u-loading v-if="loading" />
      <u-select
        v-else
        v-model="task"
        :data="data"
        @change="forceToRefresh"
      />
    </template>
  </x-request>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import logseerService from 'kubecube/services/logseer';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
export default {
    inject: [ 'forceToRefresh' ],
    data() {
        return {
            service: logseerService.getLogconfigList,
            tasks: [],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        clusterName: get('scope/cluster@value'),
        requestParam() {
            return {
                pathParams: {},
                params: {
                    cluster: this.clusterName,
                    namespace: this.namespace,
                    pageSize: 10000,
                },
            };
        },
        task: sync('lens/task'),
    },
    methods: {
        resolver(response) {
            const list = [
                { text: '全部任务', value: 'all' },
                ...(response.items || []).map(i => ({
                    text: i.name,
                    value: i.name,
                })) ];

            setValueIfListNotPresent({
                list,
                path: 'value',
                current: this.task,
            }, val => {
                this.task = val.value;
            });

            return list;
        },
    },
};
</script>

<style>

</style>
