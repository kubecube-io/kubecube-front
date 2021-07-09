<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-notice
        icon="warning"
        color="info"
      >
        服务（Service）可通过负载均衡控制器暴露给容器云外的应用访问，启用外部访问需指定从负载均衡控制器上对外暴露的端口，端口不可使用80和443，<协议, 端口>组合不可重复，端口不可被其他业务占用。可以通过负载均衡控制器的IP：port进行访问。负载均衡控制器有多个实例，可以通过DNS关联，实现高可用。服务端口修改会导致端口设置失效，失效设置在下一次提交设置时将被自动清理。
      </u-notice>
      <u-linear-layout>
        <u-button
          color="primary"
          @click="$refs.externalDialog.open()"
        >
          设置
        </u-button>
        <x-request
          ref="request"
          :class="[$style.textWrap, 'f-toe']"
          :service="externalService"
          :params="requestParam"
          :processor="resolverAddress"
        >
          <template slot-scope="{ data }">
            <span :title="(data || []).join(',')">
              访问地址: {{ (data || []).join(',') }}
            </span>
          </template>
        </x-request>
      </u-linear-layout>
    </u-linear-layout>

    <x-request
      ref="request"
      style="margin-top: 20px;"
      :service="externalAddressService"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :columns="columns"
          :loading="loading"
          :error="error"
          :items="data || []"
        />
      </template>
    </x-request>
    <external-dialog
      ref="externalDialog"
      :instance="instance"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import extendWorkloadService from 'kubecube/services/k8s-extend-resource';
import externalDialog from './external-dialog.vue';

export default {
    components: {
        externalDialog,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            externalService: extendWorkloadService.getExternalAddress,
            externalAddressService: extendWorkloadService.getExternalAddressInService,
            columns: [
                { title: '对外服务端口', name: 'ex' },
                { title: '类型', name: 'protocol' },
                { title: '服务端口', name: 'servicePort' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    name: this.instance.metadata.name,
                },
            };
        },
    },
    methods: {
        resolverAddress(response) {
            return response || [];
        },
        resolver(response) {
            return (response || []).map(t => ({
                ...t,
                ex: getFunc(t, 'externalPorts[0]'),
            }));
        },

    },
};
</script>

<style module>
.wrap[error] {
    color: $brand-error;
}
.textWrap {
    display: inline-block;
    margin-left: 100px;
    max-width: 500px;
    vertical-align: middle;
}
</style>
