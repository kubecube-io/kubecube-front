<template>
  <x-request
    ref="request"
    :service="eventService"
    :params="requestParam"
    :processor="resolver"
  >
    <template slot-scope="{ data, loading, error }">
      <kube-table
        table-width="100%"
        :columns="columns"
        :loading="loading"
        :error="error"
        :items="(data? data.list : [])"
      >
        <template #[`item.firstTimestamp`]="{ item }">
          {{ item.firstTimestamp | formatLocaleTime }}
        </template>
        <template #[`item.lastTimestamp`]="{ item }">
          {{ item.lastTimestamp | formatLocaleTime }}
        </template>
        <template #noData>
          暂无数据
        </template>
      </kube-table>
      <u-page
        v-if="data && calculatePages(data.total) > 0"
        :count="data.total"
        :page-size="pagenation.pageSize"
        :total="calculatePages(data.total)"
        @select="selectPage"
      />
    </template>
  </x-request>
</template>

<script>
import { pickBy } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import {
    toPlainObject as toEventPlainObject,
} from 'kubecube/k8s-resources/event/index.js';

export default {
    metaInfo: {
        title: 'kubecube',
        titleTemplate: '%s - Event',
    },
    mixins: [ PageMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            eventService: workloadService.getResourceListWithoutNamespace,
            columns: [
                { title: '消息', name: 'message', textwrap: true },
                { title: '原因', name: 'reason', width: '120px' },
                { title: '事件对象fieldPath', name: 'involvedObject.fieldPath', width: '160px' },
                { title: '首次出现时间', name: 'firstTimestamp', width: '160px' },
                { title: '上次出现时间', name: 'lastTimestamp', width: '160px' },
                { title: '计数', name: 'count', width: '50px' },
            ],
            kind: 'Node',
        };
    },
    computed: {
        cluster() {
            return this.$route.params.name;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    resource: 'events',
                },
                params: {
                    ...pickBy(this.pagenation, i => !!i), // has to be this
                    fieldSelector: `involvedObject.kind=Node,involvedObject.name=${this.$route.params.nodename}`,
                },
            };
        },

    },

    methods: {
        resolver(response) {
            return {
                list: (response.items || []).map(toEventPlainObject),
                total: response.total,
            };
        },
    },
};
</script>

<style>

</style>
