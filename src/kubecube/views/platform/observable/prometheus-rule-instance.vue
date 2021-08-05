<template>
  <x-request
    ref="request"
    :service="service"
    :params="params"
    :processor="resolver"
  >
    <template slot-scope="{ data, loading }">
      <u-loading v-if="loading" />
      <router-view
        v-else
        :instance="data"
      />
    </template>
  </x-request>
</template>

<script>
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toPrometheusRulePlainObject,
    RESOURCE,
} from 'kubecube/k8s-resources/prometheusRule/global';
export default {
    data() {
        return {
            service: workloadService.getNamespaceCRResourceInstance,
        };
    },
    computed: {
        cluster() {
            return this.$route.params.cluster;
        },
        instance() {
            return this.$route.params.instance;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    ...RESOURCE,
                    name: this.instance,
                },
            };
        },
    },
    methods: {
        resolver(response) {
            return toPrometheusRulePlainObject(response);
        },
    },
};
</script>

<style>

</style>
