<template>
  <u-modal
    title="外部访问设置"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <u-form>
        <u-loading v-if="loading" />
        <kube-dynamic-block
          v-else
          v-model="data"
          style="width: 100%;"
          hide-close
          :data-template="getDataTemplate"
          :show-button="false"
        >
          <template slot="column">
            <th width="100px">
              服务端口
            </th>
            <th width="100px">
              协议
            </th>
            <th>对外服务端口</th>
          </template>
          <template slot-scope="{ model, index }">
            <td>
              {{ model.servicePort }}
            </td>
            <td>
              {{ model.protocol }}
            </td>
            <td>
              <u-linear-layout>
                <u-switch
                  v-model="model.enable"
                  :with-text="true"
                />
                <validation-provider
                  v-slot="{ errors }"
                  :name="`external-port-${index}`"
                  :rules="{
                    required: model.enable,
                    ConsistofNumber: true,
                    NumberBetween: { min: 1, max: 65535 },
                  }"
                  style="flex: 1"
                >
                  <kube-form-item
                    muted="no"
                    style="max-width: 100%;margin-top: 5px"
                    field-size="full"
                    layout="none"
                    :message="errors && errors[0]"
                    placement="bottom"
                  >
                    <u-input
                      v-model="model.ex"
                      size="normal huge"
                      :disabled="!model.enable"
                      :color="errors && errors[0] ? 'error' : ''"
                      placeholder="1-65535内的整数"
                    />
                  </kube-form-item>
                </validation-provider>
              </u-linear-layout>
            </td>
          </template>
        </kube-dynamic-block>
        <u-submit-button
          :click="submit.bind(this)"
          place="right"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
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
    </validation-observer>
  </u-modal>
</template>
<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import extendWorkloadService from 'kubecube/services/k8s-extend-resource';

export default {
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            data: [],
            loading: false,
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
                ex: getFunc(i, 'externalPorts[0]', ''),
                enable: (i.externalPorts || []).length > 0,
            }));
        },
        getDataTemplate() {
            return {};
        },
        async submit() {
            const data = this.data.map(i => (i.enable ? {
                protocol: i.protocol,
                servicePort: i.servicePort,
                externalPorts: [ parseInt(i.ex) ],
            } : {
                protocol: i.protocol,
                servicePort: i.servicePort,
            }));
            await extendWorkloadService.setExternalAddressInService({
                ...this.requestParam,
                data,
            });
            this.close();
        },
    },
};
</script>

<style module>
.formItem[class] {
    margin-bottom: 30px !important;
}
</style>
