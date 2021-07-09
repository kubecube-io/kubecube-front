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
      >
        <div>
          通过四层负载均衡访问关联工作负载实例
        </div>
      </kube-name-input>

      <kube-form-item
        label="类型"
        layout="block"
      >
        <u-radios v-model="type">
          <u-radio label="ClusterIP">
            ClusterIP
          </u-radio>
          <u-radio label="nodePort">
            NodePort
          </u-radio>
        </u-radios>
        <div>
          {{ typeDescription }}
        </div>
      </kube-form-item>

      <kube-form-item
        v-if="type === 'ClusterIP'"
        label="使用方式"
        layout="block"
      >
        <u-radios v-model="model.spec.template">
          <u-radio label="normal">
            常规服务
          </u-radio>
          <u-radio label="headless">
            Headless 服务
          </u-radio>
          <u-radio label="external">
            外部服务
          </u-radio>
        </u-radios>
        <div>
          {{ templateDescription }}
        </div>
      </kube-form-item>

      <kube-deployment-selector-input
        v-if="model.spec.template !== 'external'"
        v-model="model.spec.matchLabels"
        :is-edit="isEdit"
        :required="model.spec.template === 'normal'"
      />

      <kube-form-item
        label="标签"
        layout="block"
      >
        <kube-label-editor
          v-model="model.metadata.labels"
          style="width: 580px"
        />
      </kube-form-item>

      <ports-editor
        v-model="model.spec.ports"
        :is-node-port="model.spec.template === 'nodePort'"
        :required="model.spec.template !== 'headless'"
      />

      <kube-form-item
        v-if="model.spec.template === 'external'"
        label="Endpoints"
        layout="block"
        description="请输入IP地址，多个IP地址已空格分割。不支持输入以下IP地址: 127.0.0.0/8, 169.254.0.0/16, 224.0.0.0/24。"
      >
        <u-chips
          ref="ip"
          v-model="model.spec.externalIPs"
          placeholder="需填写正确的 IP 地址，多个 IP 地址以空格分隔"
          :rules="chipRule"
          :can-be-empty="true"
        />
      </kube-form-item>

      <kube-form-item
        v-if="model.spec.template !== 'headless'"
        label="会话保持"
      >
        <u-switch
          v-model="serviceSessionSwitch"
          width="wide"
        >
          {{ serviceSessionSwitch ? 'ON' : 'OFF' }}
        </u-switch>
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
import { get as getFunc, set, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import {
    toPlainObject as toServicePlainObject,
    toK8SObject as toServiceK8SObject,
    patchK8SObject as toPatchServiceObject,
} from 'kubecube/k8s-resources/service';
import workloadService from 'kubecube/services/k8s-resource';
import portsEditor from './ports.vue';
export default {
    components: {
        portsEditor,
    },
    props: {
        instance: Object,
    },
    data() {
        console.log(this.instance);
        return {
            model: cloneDeep(this.instance) || toServicePlainObject(),
            chipRule: [
                {
                    type: 'is',
                    options: /^[\d.\s]+$/,
                    trigger: 'input',
                    message: 'IP 地址格式不正确',
                },
                {
                    type: 'method',
                    message: 'IP 地址格式不正确',
                    trigger: 'blur',
                    options: value => {
                        const arr = value.split('.');
                        if (arr.length !== 4) return false;
                        if (
                            arr.some(
                                item =>
                                    !item.length ||
                                        isNaN(item) ||
                                        item < 0 ||
                                        item > 255
                            )
                        ) { return false; }
                        return true;
                    },
                },
                {
                    type: 'method',
                    message: '该 IP 地址已存在',
                    trigger: 'blur',
                    options: value => !this.model.spec.externalIPs.includes(value),
                },
                {
                    type: 'method',
                    message: '该 IP 地址在禁止地址段内',
                    trigger: 'blur',
                    options: value => {
                        const arr = value.split('.');
                        // 127.0.0.0/8
                        if (+arr[0] === 127) return false;
                        // 169.254.0.0/16
                        if (+arr[0] === 169 && +arr[1] === 254) { return false; }
                        // 224.0.0.0/24
                        if (
                            +arr[0] === 224 &&
                                +arr[1] === 0 &&
                                +arr[2] === 0
                        ) { return false; }
                        return true;
                    },
                },
                {
                    type: 'method',
                    message: '最多添加1000个 IP 地址',
                    trigger: 'blur',
                    options: () => this.model.spec.externalIPs.length < 1000,
                },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        type: {
            get() {
                const s = getFunc(this.model, 'spec.template');
                return [ 'normal', 'external', 'headless' ].includes(s) ? 'ClusterIP' : 'nodePort';
            },
            set(val) {
                console.log(val);
                if (val === 'nodePort') {
                    set(this.model, 'spec.template', 'nodePort');
                }
                if (val === 'ClusterIP') {
                    set(this.model, 'spec.template', 'normal');
                }
            },
        },
        serviceSessionSwitch: {
            get() {
                return getFunc(this.model, 'spec.sessionAffinity') === 'ClientIP';
            },
            set(val) {
                set(this.model, 'spec.sessionAffinity', val ? 'ClientIP' : 'None');
            },
        },
        typeDescription() {
            if (this.type === 'nodePort') return '通过集群节点静态端口暴露给集群外访问。';
            if (this.type === 'ClusterIP') return '通过集群内部域名暴露给同一集群内其他工作负载访问。';
            return '';
        },
        templateDescription() {
            if (this.model.spec.template === 'headless') return '用于StatefulSet创建过程，关联到StatefulSet资源，为StatefulSet工作副本提供静态域名';
            if (this.model.spec.template === 'external') return '用于访问部署在容器云平台外部的服务。通过 service 名称+端口提供一致的访问方式。';
            return '';
        },
    },
    methods: {
        async submit() {
            if (this.isEdit) {
                const yaml = toPatchServiceObject(this.model);
                console.log(yaml);
                await workloadService.patchAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'services',
                        name: this.instance.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toServiceK8SObject(this.model);
                await workloadService.createAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'services',
                    },
                    data: yaml,
                });
            }

            this.$router.push({ path: '/control/services/list' });
        },
    },
};
</script>

<style>

</style>
