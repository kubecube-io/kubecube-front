<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form ref="form">
      <kube-name-input
        v-model="model.metadata.name"
        layout="block"
        :disabled="isEdit"
      />
      <kube-form-item
        label="端口"
        required
      >
        <u-select
          v-model="model.spec.port"
          :data="ports"
        />
      </kube-form-item>

      <kube-form-item
        label="调度算法"
        required
      >
        <u-select
          v-model="model.spec.annotations.dispatch"
          :data="dispatches"
        />
      </kube-form-item>

      <secret-select
        v-if="model.spec.port === 443"
        v-model="model.spec.singleTLS.secretName"
        description="所有域名使用相同证书"
        :init-visible="model.spec.singleTLS.enable"
      >
        <template #data="{ data, setVisible }">
          <u-switch
            v-model="model.spec.singleTLS.enable"
            :disabled="!data || !data.length"
            width="wide"
            style="margin-bottom: 10px"
            @change="setVisible($event.value)"
          />
        </template>
      </secret-select>

      <host-block
        v-model="model.spec.rulesConfig"
        :port="model.spec.port"
        :enable-secret="model.spec.port === 443 && !model.spec.singleTLS.enable"
      />

      <kube-form-item
        label="会话保持"
        layout="block"
      >
        <u-switch
          v-model="model.spec.annotations.enableSession"
          :with-text="true"
          width="wide"
        />
      </kube-form-item>
      <validation-provider
        v-if="model.spec.annotations.enableSession"
        v-slot="{ errors }"
        name="session"
        rules="required|Cookie"
      >
        <kube-form-item
          :message="errors && errors[0]"
          label="Cookie 名称"
          layout="block"
          required
          description="访问时需携带对应名称的cookie，会话保持功能才能正常工作。"
        >
          <u-input
            v-model="model.spec.annotations.cookieName"
            size="normal large"
            :maxlength="1024"
            maxlength-message="Cookie 名称最多输入1024个字符"
            :color="errors && errors[0] ? 'error' : ''"
          />
        </kube-form-item>
      </validation-provider>
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
                立即创建
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { get as getFunc, set, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import {
    toPlainObject as toIngressPlainObject,
    toK8SObject as toIngressK8SObject,
    patchK8SObject as toPatchIngressObject,
} from 'kubecube/k8s-resources/ingress';
import workloadService from 'kubecube/services/k8s-resource';
import secretSelect from './component/secret-select.vue';
import hostBlock from './component/host-block.vue';
import {
    PORTS, DISPATCHS,
} from 'kubecube/utils/constance';

export default {
    components: {
        secretSelect,
        hostBlock,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            model: cloneDeep(this.instance) || toIngressPlainObject(),
            ports: PORTS,
            dispatches: DISPATCHS,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
    },
    methods: {
        async submit() {
            if (this.isEdit) {
                const yaml = toPatchIngressObject(this.model);
                console.log(yaml);
                await workloadService.patchNetworkingInstance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'ingresses',
                        name: this.instance.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toIngressK8SObject(this.model);
                await workloadService.createNetworkingInstance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'ingresses',
                    },
                    data: yaml,
                });
            }

            this.$router.push({ path: '/control/ingresses/list' });
        },
    },
};
</script>

<style>

</style>
