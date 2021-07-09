<template>
  <div>
    <x-request
      :service="service"
      :params="{
        pathParams: {
          cluster: clusterName,
          resource: 'nodes',
          name: nodeName
        }
      }"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <u-loading v-if="loading" />
        <div v-else-if="error">
          加载出错！
        </div>
        <template v-else>
          <u-tabs router>
            <u-tab
              v-for="(item, index) in tabs"
              :key="index"
              :value="item"
              :title="item.title"
              :to="item.route"
            />
          </u-tabs>
          <router-view :instance="data" />
        </template>
      </template>
    </x-request>
  </div>
</template>

<script>
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toNodePlainObject,
} from 'kubecube/k8s-resources/node';
export default {
    data() {
        return {
            service: workloadService.getResourceWithoutNamespace,

        };
    },
    computed: {
        clusterName() {
            return this.$route.params.name;
        },
        nodeName() {
            return this.$route.params.nodename;
        },
        tabs() {
            return [
                { title: '详情', route: { name: 'platform.cluster.nodedetail.info', params: this.$route.params } },
                { title: '副本', route: { name: 'platform.cluster.nodedetail.pod', params: this.$route.params } },
                { title: '监控', route: { name: 'platform.cluster.nodedetail.monitor', params: this.$route.params } },
                { title: '事件', route: { name: 'platform.cluster.nodedetail.event', params: this.$route.params } },
            ];
        },
    },
    methods: {
        resolver(response) {
            return toNodePlainObject(response);
        },
    },
};
</script>

<style>

</style>
