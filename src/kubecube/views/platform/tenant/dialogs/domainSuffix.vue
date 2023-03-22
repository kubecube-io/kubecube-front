<template>
    <el-dialog
      title="定制域名后缀"
      :visible.sync="show"
      width="800px"
      :close-on-click-modal="false"
    >
      <div>
        该配置信息用于负载均衡（Ingress）转发规则所用的域名后缀
      </div>
      <el-form ref="form" :model="model">
        <el-form-item label="">
          <dynamicBlock
            v-model="model.domainSuffixList"
            :getDefaultItem="getDataTemplate"
            :columns="[
              {
                title: '',
                dataIndex: 'order',
                width: '120px'
              },
              {
                title: '',
                dataIndex: 'name',
              },
            ]"
          >
            <template v-slot:order="{index}">
              <div style="text-align: right">
                域名后缀{{ index + 1 }}:
              </div>
            </template>
            <template v-slot:name="{record, index}">
              <el-form-item 
                label=""
                :prop="`domainSuffixList.${index}.name`"
                :rules="[
                  validators.ingressSuffix(),
                  validators.noRedundance(existSuffixs)
                ]"
              >
                <el-input
                  v-model="record.name"
                />
              </el-form-item>
            </template>
          </dynamicBlock>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="submit" :loading="commitLoading">确 定</el-button>
      </div>
    </el-dialog>
</template>
<script>
import k8sResourceService from 'kubecube/services/k8s-resource';
import { get } from 'vuex-pathify';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
        dynamicBlock,
    },
    data() {
        return {
            valid: true,
            show: false,
            projectInfo: null,
            model: {
                domainSuffixList: [],
            },
            rules: {
                domainSuffix: [
                    { type: 'string', required: true, trigger: 'input+blur', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'input', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'blur', message: '请输入合法的 ingress 后缀' },
                    { type: 'string', trigger: 'input+blur', message: '域名后缀重复', validator: (rule, value, callback) => {
                        const targets = this.model.domainSuffixList.filter(item => item.name).filter(item => item.name === value);
                        if (targets.length > 1) { callback(new Error()); } else { callback(); }
                    } },
                ],
            },
            validators,
            commitLoading: false,
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
        existSuffixs() {
            return this.model.domainSuffixList.map(item => item.name).filter(item => item);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                name: '',
            };
        },
        addDomainSuffixItem() {
            this.model.domainSuffixList.push({ name: '' });
        },
        removeDomainSuffixItem(index) {
            this.model.domainSuffixList.splice(index, 1);
        },
        open(projectInfo) {
            this.projectInfo = projectInfo;
            this.model.domainSuffixList = projectInfo.spec.ingressDomainSuffix ? projectInfo.spec.ingressDomainSuffix.map(val => {
                return {
                    name: val,
                };
            }) : [];
            this.show = true;
        },
        close() {
            this.show = false;
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            this.commitLoading = true;
            try {
                await k8sResourceService.patchClusterCRResourceInstance({
                    pathParams: {
                        cluster: this.controlClusterList[0].clusterName,
                        group: 'tenant.kubecube.io',
                        version: 'v1',
                        plural: 'projects',
                        name: this.projectInfo.metadata.name,
                    },
                    data: [{
                        op: 'replace',
                        path: '/spec/ingressDomainSuffix',
                        value: this.model.domainSuffixList.map(item => item.name).filter(item => item),
                    }],
                    headers: {
                        'Content-Type': 'application/json-patch+json',
                    },
                });
                this.show = false;
                this.$emit('refresh');
            } catch (error) {
                console.log(error);
            }
            this.commitLoading = false;
        },
    },
};
</script>
<style module>
.tableCell{
  line-height: 38px;
}
</style>
