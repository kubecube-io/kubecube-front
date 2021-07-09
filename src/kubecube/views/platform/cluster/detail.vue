<template>
  <div>
    <template v-if="isInNodeRoute || isInNetworkRoute">
      <router-view />
    </template>
    <template v-else>
      <u-head-card :title="clusterName">
        <div slot="logo">
          {{ (clusterName || '').substring(0, 2).toUpperCase() }}
        </div>
      </u-head-card>
      <x-request
        :service="service"
        :params="{
          params: {
            cluster: clusterName
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
                :to="{ path: item.path }"
              />
            </u-tabs>
            <router-view :instance="data" />
          </template>
        </template>
      </x-request>
    </template>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import clusterService from 'kubecube/services/cluster';
export default {
    data() {
        return {
            service: clusterService.getClusters,
        };
    },
    computed: {
        clusterName() {
            return this.$route.params.name;
        },
        tabs() {
            return [
                { title: '详情', path: `/platform/cluster/${this.clusterName}/info` },
                { title: '节点', path: `/platform/cluster/${this.clusterName}/node` },
                { title: '存储类别', path: `/platform/cluster/${this.clusterName}/storageclass` },
                { title: '持久存储', path: `/platform/cluster/${this.clusterName}/persistentvolumes` },
                { title: '网络策略', path: `/platform/cluster/${this.clusterName}/network` },
                { title: '集群日志', path: `/platform/cluster/${this.clusterName}/log` },
                { title: '监控', path: `/platform/cluster/${this.clusterName}/monitor` },
            ];
        },
        isInNodeRoute() {
            return this.$route.name.startsWith('platform.cluster.nodedetail');
        },
        isInNetworkRoute() {
            return [ 'platform.cluster.detail.network.create', 'platform.cluster.detail.network.edit' ].includes(this.$route.name);
        },
    },
    methods: {
        resolver(response) {
            return getFunc(response, 'items.[0]');
        },
    },
};
</script>

<style>

</style>
