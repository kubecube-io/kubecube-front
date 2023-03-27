<template>
  <div>
    <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
    <el-form v-else ref="form" :model="model" label-position="right" label-width="120px">
      <el-form-item
        label="名称"
        prop="metadata.name"
        :rules="[
          validators.required(),
          validators.k8sResourceNameValidator(),
        ]"
      >
        <el-input
          v-model="model.metadata.name"
          :disabled="isEdit"
          placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"
        />
      </el-form-item>
      <el-form-item
        label="空间"
        prop="metadata.namespace"
        :rules="[
          validators.required()
        ]"
      >
        <ns-select
          v-model="model.metadata.namespace"
          :cluster="cluster"
          :disabled="isEdit"
        />
      </el-form-item>
      <el-form-item
        label="访问目标"
      >
        <el-radio-group v-model="selections.target">
          <el-radio label="all">所有副本</el-radio>
          <el-radio label="regular">
            符合规则的副本
            <el-tooltip effect="dark" content="多条规则间是“与”的关系，至少有一条规则" placement="right" popper-class="ncs-el-tooltip-popper">
              <i class="el-icon-question"/>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <template
          v-if="selections.target === 'regular'"
        >
          <regular-input
            v-model="model.spec.podSelector"
            prefix-key="target"
            prefixProp="spec.podSelector"
            :isRequired="true"
          />
        </template>
      </el-form-item>
      <el-form-item
        label="入向规则"
      >
        <div>
          来源限制
        </div>
        <el-radio-group v-model="selections.insource">
          <el-radio label="all">允许所有入向访问</el-radio>
          <el-radio label="none">禁止所有入向访问</el-radio>
          <el-radio label="regular">
            允许符合规则的入向访问
            <el-tooltip effect="dark" content="多条规则间是“或”的关系，至少有一条规则。当空间和副本规则共存时，两者是“与”的关系筛选来源" placement="right" popper-class="ncs-el-tooltip-popper">
              <i class="el-icon-question"/>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <template v-if="selections.insource === 'regular'">
          <source-block
            v-model="model.spec.ingress.from"
            prefixProp="spec.ingress.from"
          />
          <div style="margin-top: 24px">
            端口限制
          </div>
          <el-radio-group v-model="selections.inport">
            <el-radio label="all">允许访问所有端口</el-radio>
            <el-radio label="regular">
              允许访问以下端口
              <el-tooltip effect="dark" content="多条规则间是“或”的关系，至少有一个端口" placement="right" popper-class="ncs-el-tooltip-popper">
                <i class="el-icon-question"/>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
          <template v-if="selections.inport === 'regular'">
            <port-input
              v-model="model.spec.ingress.ports"
              prefixProp="spec.ingress.ports"
            />
          </template>
        </template>
      </el-form-item>
      <el-form-item
        label="出向规则"
      >
        <div>
          目标限制
        </div>
        <el-radio-group v-model="selections.outsource">
          <el-radio label="all">允许所有出向访问</el-radio>
          <el-radio label="none">禁止所有出向访问</el-radio>
          <el-radio label="regular">
            允许符合规则的出向访问
            <el-tooltip effect="dark" content="多条规则间是“或”的关系，至少有一条规则。当空间和副本规则共存时，两者是“与”的关系筛选目标" placement="right" popper-class="ncs-el-tooltip-popper">
              <i class="el-icon-question"/>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <template v-if="selections.outsource === 'regular'">
          <source-block
            v-model="model.spec.egress.to"
            prefixProp="spec.egress.to"
          />
          <div style="margin-top: 24px">
            端口限制
          </div>
          <el-radio-group v-model="selections.outport">
            <el-radio label="all">允许访问所有端口</el-radio>
            <el-radio label="regular">
              允许访问以下端口
              <el-tooltip effect="dark" content="多条规则间是“或”的关系，至少有一个端口" placement="right" popper-class="ncs-el-tooltip-popper">
                <i class="el-icon-question"/>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
          <template v-if="selections.outport === 'regular'">
            <port-input
              v-model="model.spec.egress.ports"
              prefixProp="spec.egress.ports"
            />
          </template>
        </template>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submit"
          :loading="submitLoading"
        >
          {{ isEdit ? '立即修改' : '立即创建' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toNetworkPolicyPlainObject,
    toK8SObject as toNetworkPolicyK8SObject,
} from 'kubecube/k8s-resources/networkPolicy';
import nsSelect from './ns-select.vue';
import regularInput from './regular-input.vue';
import sourceBlock from './source-block.vue';
import portInput from './port-inputs.vue';
import * as validators from 'kubecube/utils/validators';
export default {
    components: {
        nsSelect,
        regularInput,
        portInput,
        sourceBlock,
    },
    data() {
        return {
            model: toNetworkPolicyPlainObject(),
            selections: {
                target: 'all',
                insource: 'all',
                inport: 'all',
                outsource: 'all',
                outport: 'all',
            },
            loading: false,
            validators,
            submitLoading: false,
        };
    },
    computed: {
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        cluster() {
            return this.$route.params.name;
        },
        namespace() {
            return this.$route.params.namespace;
        },
        instance() {
            return this.$route.params.instance;
        },
    },
    created() {
        if (this.isEdit) {
            this.load();
        }
    },
    methods: {
        async load() {
            this.loading = true;
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    resource: 'networkpolicies',
                    namespace: this.namespace,
                    name: this.instance,
                },
            };
            const response = await workloadService.getNetworkingInstance(reqParam);
            this.model = toNetworkPolicyPlainObject(response);
            Object.assign(this.selections, this.model.spec.selections);
            this.loading = false;
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
                if (this.isEdit) {
                    const pureSource = this.model.puresource;
                    const yaml = toNetworkPolicyK8SObject(this.model, this.selections);
                    await workloadService.modifyNetworkingInstance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.model.metadata.namespace,
                            resource: 'networkpolicies',
                            name: this.model.metadata.name,
                        },
                        data: {
                            ...pureSource,
                            spec: yaml.spec,
                        },
                    });
                } else {
                    const yaml = toNetworkPolicyK8SObject(this.model, this.selections);
                    await workloadService.createNetworkingInstance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.model.metadata.namespace,
                            resource: 'networkpolicies',
                        },
                        data: yaml,
                    });
                }
                this.$router.push({ path: `/platform/cluster/${this.cluster}/network` });
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style>

</style>
