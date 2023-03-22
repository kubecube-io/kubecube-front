<template>
  <div>
    <div>
      <el-alert
        description="服务（Service）可通过负载均衡控制器暴露给容器云外的应用访问，启用外部访问需指定从负载均衡控制器上对外暴露的端口，端口不可使用80和443，<协议, 端口>组合不可重复，端口不可被其他业务占用。可以通过负载均衡控制器的IP：port进行访问。负载均衡控制器有多个实例，可以通过DNS关联，实现高可用。服务端口名称修改会导致端口设置失效。"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <div style="margin-top: 12px">
        <el-button
          type="primary"
          @click="$refs.externalDialog.open()"
        >
          设置
        </el-button>
        <x-request
          ref="request"
          :class="[$style.textWrap]"
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
      </div>
    </div>
    <x-request
      ref="request"
      style="margin-top: 12px"
      :service="externalAddressService"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
        >
          <el-table-column
            prop="ex"
            label="对外服务端口"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.ex || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="protocol"
            label="类型"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column
            prop="servicePort"
            label="服务端口"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column
            prop="servicePortName"
            label="服务端口名称"
            :show-overflow-tooltip="true"
          ></el-table-column>
        </el-table>
      </template>
    </x-request>
    <external-dialog
      ref="externalDialog"
      :instance="instance"
      @refresh="refresh"
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
                ex: getFunc(t, 'externalPort'),
            }));
        },
        refresh() {
            this.$refs.request.request();
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
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
