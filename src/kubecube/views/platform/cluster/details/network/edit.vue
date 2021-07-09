<template>
  <u-loading v-if="loading" />
  <validation-observer
    v-else
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form ref="form">
      <kube-name-input
        v-model="model.metadata.name"
        :disabled="isEdit"
      />
      <validation-provider
        v-slot="{ errors }"
        name="Namespace"
        rules="required"
      >
        <kube-form-item
          label="空间"
          required
          :message="errors && errors[0]"
        >
          <ns-select
            v-model="model.metadata.namespace"
            :cluster="cluster"
            :disabled="isEdit"
            no-title
            size="large"
            :color="errors && errors[0] ? 'error' : ''"
          />
        </kube-form-item>
      </validation-provider>

      <kube-form-item
        label="访问目标"
        :layout="selections.target === 'regular'?'block': 'normal'"
      >
        <u-radios
          v-model="selections.target"
          style="margin-bottom: 20px;"
        >
          <u-radio label="all">
            所有副本
          </u-radio>
          <u-radio label="regular">
            符合规则的副本
            <u-note>多条规则间是“与”的关系，至少有一条规则</u-note>
          </u-radio>
        </u-radios>
        <template v-if="selections.target === 'regular'">
          <regular-input
            v-model="model.spec.podSelector"
            prefix-key="target"
            style="width: 580px"
          />
        </template>
      </kube-form-item>

      <kube-form-item
        label="入向规则"
        layout="block"
      >
        <kube-form-item
          layout="list"
          label="来源限制"
        >
          <u-radios
            v-model="selections.insource"
            style="margin-bottom: 20px;"
          >
            <u-radio label="all">
              允许所有入向访问
            </u-radio>
            <u-radio label="none">
              禁止所有入向访问
            </u-radio>
            <u-radio label="regular">
              允许符合规则的入向访问
              <u-note>多条规则间是“或”的关系，至少有一条规则。当空间和副本规则共存时，两者是“与”的关系筛选来源</u-note>
            </u-radio>
          </u-radios>
          <template v-if="selections.insource === 'regular'">
            <source-block
              v-model="model.spec.ingress.from"
              style="width: 580px"
            />
          </template>
        </kube-form-item>
        <kube-form-item
          v-if="selections.insource === 'regular'"
          layout="list"
          label="端口限制"
          style="margin-top: 20px"
        >
          <u-radios
            v-model="selections.inport"
            style="margin-bottom: 20px;"
          >
            <u-radio label="all">
              允许访问所有端口
            </u-radio>
            <u-radio label="regular">
              允许访问以下端口
              <u-note>多条规则间是“或”的关系，至少有一个端口</u-note>
            </u-radio>
          </u-radios>
          <template v-if="selections.inport === 'regular'">
            <port-input
              v-model="model.spec.ingress.ports"
              style="width: 580px"
            />
          </template>
        </kube-form-item>
      </kube-form-item>

      <kube-form-item
        label="出向规则"
        layout="block"
      >
        <kube-form-item
          layout="list"
          label="目标限制"
        >
          <u-radios
            v-model="selections.outsource"
            style="margin-bottom: 20px;"
          >
            <u-radio label="all">
              允许所有出向访问
            </u-radio>
            <u-radio label="none">
              禁止所有出向访问
            </u-radio>
            <u-radio label="regular">
              允许符合规则的出向访问
              <u-note>多条规则间是“或”的关系，至少有一条规则。当空间和副本规则共存时，两者是“与”的关系筛选来源</u-note>
            </u-radio>
          </u-radios>
          <template v-if="selections.outsource === 'regular'">
            <source-block
              v-model="model.spec.egress.to"
              style="width: 580px"
            />
          </template>
        </kube-form-item>
        <kube-form-item
          v-if="selections.outsource === 'regular'"
          layout="list"
          label="端口限制"
          style="margin-top: 20px"
        >
          <u-radios
            v-model="selections.outport"
            style="margin-bottom: 20px;"
          >
            <u-radio label="all">
              允许访问所有端口
            </u-radio>
            <u-radio label="regular">
              允许访问以下端口
              <u-note>多条规则间是“或”的关系，至少有一个端口</u-note>
            </u-radio>
          </u-radios>
          <template v-if="selections.outport === 'regular'">
            <port-input
              v-model="model.spec.egress.ports"
              style="width: 580px"
            />
          </template>
        </kube-form-item>
      </kube-form-item>

      <kube-form-item>
        <u-submit-button
          :click="submit.bind(this)"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                {{ isEdit ? '立即修改' : '立即创建' }}
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toNetworkPolicyPlainObject,
    toK8SObject as toNetworkPolicyK8SObject,
    // patchK8SObject as toPatchNetworkPolicyObject,
} from 'kubecube/k8s-resources/networkPolicy';
import nsSelect from './ns-select.vue';
import regularInput from './regular-input.vue';
import sourceBlock from './source-block.vue';
import portInput from './port-inputs.vue';
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
        },
    },
};
</script>

<style>

</style>
