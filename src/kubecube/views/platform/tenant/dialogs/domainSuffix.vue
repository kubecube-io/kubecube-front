<template>
  <u-modal
    title="定制域名后缀"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <u-form>
      <u-text>
        该配置信息用于负载均衡（Ingress）转发规则所用的域名后缀
      </u-text>
      <u-form-table
        style="width:100%"
        @validate="valid = $event.valid"
      >
        <tbody>
          <tr
            is="u-form-table-tr"
            v-for="(item, index) in model.domainSuffixList"
            :key="index"
            :rules="rules"
          >
            <td
              width="100px"
              :class="$style.tableCell"
            >
              域名后缀{{ index + 1 }}:
            </td>
            <td width="360px">
              <u-input
                v-model="item.name"
                name="domainSuffix"
                size="huge"
              />
            </td>
            <td width="40px">
              <u-form-table-remove-button @click="removeDomainSuffixItem(index)" />
            </td>
          </tr>
          <tr>
            <td colspan="4">
              <u-form-table-add-button @click="addDomainSuffixItem">添加</u-form-table-add-button>
            </td>
          </tr>
        </tbody>
      </u-form-table>
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
            projectInfo: null,
            model: {
                domainSuffixList: [],
            },
            rules: {
                domainSuffix: [
                    { type: 'string', required: true, trigger: 'input+blur', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'input', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'blur', message: '请输入合法的 ingress 后缀' },
                ],
            },
        };
    },
    methods: {
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
            // '/{cluster}/apis/{group}/{version}/{plural}'
            await k8sResourceService.patchClusterCRResourceInstance({
                pathParams: {
                    cluster: 'pivot-cluster',
                    group: 'tenant.kubecube.io',
                    version: 'v1',
                    plural: 'projects',
                    name: this.projectInfo.metadata.name,
                },
                data: [{
                    op: 'replace',
                    path: '/spec/ingressDomainSuffix',
                    value: this.model.domainSuffixList.map(item => item.name),
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
<style module>
.tableCell{
  line-height: 38px;
}
</style>
