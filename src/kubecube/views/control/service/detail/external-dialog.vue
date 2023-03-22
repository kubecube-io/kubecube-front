<template>
  <div>
    <el-dialog
      title="外部访问设置"
      :visible.sync="show"
      width="640px"
      @close="close"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="data">
        <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
        <el-form-item v-else>
          <dynamicBlock
            v-model="data"
            :getDefaultItem="getDataTemplate"
            :showDeleteBtn="false"
            :showAddBtn="false"
            :columns="[
                {
                    title: '服务端口',
                    dataIndex: 'servicePort',
                },
                {
                    title: '协议',
                    dataIndex: 'protocol',
                },
                {
                    title: '对外服务端口',
                    dataIndex: 'ex',
                    width: '250px'
                },
                {
                    title: '服务端口名称',
                    dataIndex: 'servicePortName',
                },
            ]"
          >
            <template v-slot:ex="{record: dataModel, index: dataIndex}">
              <div style="display:flex;align-items:center">
                <el-switch
                  v-model="dataModel.enable"
                  style="margin-right:8px"
                  @change="dataModel.ex = ''"
                />
                <el-form-item 
                  label=""
                  :prop="`${dataIndex}.ex`"
                  :rules="[
                    validators.consistofNumber(false),
                    validators.numberBetween(1, 65535, false),
                  ]"
                >
                  <el-input
                    v-model="dataModel.ex"
                    placeholder="1-65535内的整数"
                    :disabled="!dataModel.enable"
                  />
                </el-form-item>
              </div>
            </template>
          </dynamicBlock>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="submit" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import extendWorkloadService from 'kubecube/services/k8s-extend-resource';
import * as validators from 'kubecube/utils/validators';
export default {
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            validators,
            data: [],
            loading: false,
            submitLoading: false,
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
        open() {
            this.loadExternals();
            this.show = true;
        },
        async loadExternals() {
            this.loading = true;
            const response = await extendWorkloadService.getExternalAddressInService(this.requestParam);
            this.data = this.resolver(response);
            this.loading = false;
        },
        resolver(response) {
            return (response || []).map(i => ({
                ...i,
                ex: getFunc(i, 'externalPort', ''),
                enable: !!i.externalPort,
            }));
        },
        getDataTemplate() {
            return {};
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            this.submitLoading = true;
            try {
                const data = this.data.map(i => (i.enable ? {
                    protocol: i.protocol,
                    servicePort: i.servicePort,
                    externalPort: parseInt(i.ex),
                } : {
                    protocol: i.protocol,
                    servicePort: i.servicePort,
                }));
                await extendWorkloadService.setExternalAddressInService({
                    ...this.requestParam,
                    data,
                });
                this.$emit('refresh');
                this.close();
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style module>
.formItem[class] {
    margin-bottom: 30px !important;
}
</style>
