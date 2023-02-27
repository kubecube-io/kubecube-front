<template>
  <el-dialog
    title="定制域名后缀"
    :visible.sync="show"
    width="700px"
    :close-on-click-modal="false"
  >
    <el-form
      v-if="show"
      ref="form"
      :model="model"
      label-position="right"
      label-width="120px"
    >
      <el-form-item
        label="Ingress 后缀"
        prop="domainSuffix"
        :rules="[
          validators.ingressSuffix(),
        ]"
      >
        <el-input v-model="model.domainSuffix" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">
        取 消
      </el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="submit"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import k8sResourceService from 'kubecube/services/k8s-resource';
import { get } from 'vuex-pathify';
import { validatorsMixin } from 'kubecube/mixins';
export default {
    mixins: [ validatorsMixin ],
    data() {
        return {
            valid: true,
            show: false,
            clusterInfo: null,
            model: {
                preDomainSuffix: '',
                domainSuffix: '',
            },
            rules: {
                domainSuffix: [
                    // { type: 'string', required: true, trigger: 'input+blur', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'input', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'blur', message: '请输入合法的 ingress 后缀' },
                ],
            },
            submitLoading: false,
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
    },
    methods: {
        open(clusterInfo) {
            this.clusterInfo = clusterInfo;
            this.model.domainSuffix = clusterInfo.ingressDomainSuffix || '';
            this.show = true;
        },
        close() {
            this.show = false;
        },
        async submit() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
                await k8sResourceService.patchClusterCRResourceInstance({
                    pathParams: {
                        cluster: this.controlClusterList[0].clusterName,
                        group: 'cluster.kubecube.io',
                        version: 'v1',
                        plural: 'clusters',
                        name: this.clusterInfo.clusterName,
                    },
                    data: [{
                        op: 'replace',
                        path: '/spec/ingressDomainSuffix',
                        value: this.model.domainSuffix,
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
            this.submitLoading = false;
        },
    },
};
</script>
