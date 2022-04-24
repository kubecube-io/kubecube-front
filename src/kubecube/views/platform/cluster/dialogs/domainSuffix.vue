<template>
  <u-modal
    title="定制域名后缀"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <u-form
      :rules="rules"
      @validate="valid = $event.valid"
    >
      <u-form-item
        label="Ingress 后缀:"
        name="domainSuffix"
      >
        <u-input
          v-model="model.domainSuffix"
          size="large"
        />
      </u-form-item>
      <u-submit-button
        :click="submit.bind(this)"
        place="right"
      >
        <template slot-scope="scope">
          <u-linear-layout>
            <u-button
              color="primary"
              :disabled="!valid || scope.submitting"
              :icon="scope.submitting ? 'loading' : ''"
              @click="scope.submit"
            >
              确定
            </u-button>
            <u-button @click="close">
              取消
            </u-button>
          </u-linear-layout>
        </template>
      </u-submit-button>
    </u-form>
  </u-modal>
</template>
<script>
import k8sResourceService from 'kubecube/services/k8s-resource';
export default {
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
        };
    },
    methods: {
        open(clusterInfo) {
            this.clusterInfo = clusterInfo;
            this.model.domainSuffix = clusterInfo.ingressDomainSuffix;
            this.show = true;
        },
        close() {
            this.show = false;
        },
        async submit() {
            // '/{cluster}/apis/{group}/{version}/{plural}'
            await k8sResourceService.patchClusterCRResourceInstance({
                pathParams: {
                    cluster: 'pivot-cluster',
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
        },
    },
};
</script>
<style>

</style>
