<template>
  <div>
    <el-form ref="form" :model="model" label-position="right" label-width="120px" style="width:80%">
      <el-form-item
        label="名称"
        prop="metadata.name"
        :rules="[
          validators.required(),
          validators.k8sResourceNameValidator(),
        ]"
      >
        <el-input v-model="model.metadata.name" :disabled="isEdit" placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"/>
      </el-form-item>
      <el-form-item
        label="端口"
        prop="spec.port"
        :rules="[
          validators.required(),
        ]"
      >
        <el-select
          v-model="model.spec.port"
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in ports"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="调度算法"
        prop="spec.annotations.dispatch"
        :rules="[
          validators.required(),
        ]"
      >
        <el-select
          v-model="model.spec.annotations.dispatch"
          filterable
          placeholder="请选择"
        >
          <el-option
            v-for="item in dispatches"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
      </el-form-item>
      <secret-select
        v-if="model.spec.port === 443"
        v-model="model.spec.singleTLS.secretName"
        description="所有域名使用相同证书"
        :init-visible="model.spec.singleTLS.enable"
        prefixProp="spec.singleTLS.secretName"
      >
        <template #data="{ data, setVisible }">
          <el-switch
            v-model="model.spec.singleTLS.enable"
            :disabled="!data || !data.length"
            @change="setVisible($event)"
          />
        </template>
      </secret-select>
      <el-form-item
        label="转发规则"
        prop="spec.rulesConfig"
        :rules="[
          validators.required(),
        ]"
      >
        <host-block
          v-model="model.spec.rulesConfig"
          :port="model.spec.port"
          :enable-secret="model.spec.port === 443 && !model.spec.singleTLS.enable"
          prefixProp="spec.rulesConfig"
        />
      </el-form-item>
      <el-form-item
        label="会话保持"
      >
        <el-switch
          v-model="model.spec.annotations.enableSession"
        />
      </el-form-item>
      <el-form-item
        v-if="model.spec.annotations.enableSession"
        label="Cookie 名称"
        prop="spec.annotations.cookieName"
        :rules="[
          validators.required(),
          validators.cookie(false),
        ]"
      >
        <div style="color: #999">访问时需携带对应名称的cookie，会话保持功能才能正常工作。</div>
        <el-input
          v-model="model.spec.annotations.cookieName"
        />
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
import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import {
    toPlainObject as toIngressPlainObject,
    toK8SObject as toIngressK8SObject,
    toModifyK8SObject as toModifyIngressK8SObject,
} from 'kubecube/k8s-resources/ingress';
import workloadService from 'kubecube/services/k8s-resource';
import secretSelect from './component/secret-select.vue';
import hostBlock from './component/host-block.vue';
import {
    PORTS, DISPATCHS,
} from 'kubecube/utils/constance';
import * as validators from 'kubecube/utils/validators';

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
            submitLoading: false,
            validators,
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
    watch: {
        ['model.spec.port'](val) {
            if(val === 80) {
                this.model.spec.singleTLS.enable = false
            }
        },
        ['model.spec.annotations.enableSession'](val) {
            this.model.spec.annotations.cookieName = ''
        }
    },
    created() {
        this.$watch('model', (newVal, oldVal) => {
            this.$emit('inputChange', true);
        },
        {
            deep: true,
        });
    },
    methods: {
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
                    const instance = await workloadService.getNetworkingInstance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'ingresses',
                            name: this.instance.metadata.name,
                        },
                    });
                    this.model.puresource = instance;
                    const yaml = toModifyIngressK8SObject(this.model);
                    console.log(yaml);
                    await workloadService.modifyNetworkingInstance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'ingresses',
                            name: this.instance.metadata.name,
                        },
                        data: yaml,
                        noAlert: true,
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
                        noAlert: true,
                    });
                }
                this.$emit('inputChange', false);
                this.$router.push({ path: '/control/ingresses/list' });
            } catch (err) {
                console.log(err);
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.submitLoading = false;
        },
        handleValidate() {
            this.$refs.observer.validate();
        }
    },
};
</script>

<style module>
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubecube/assets/question.svg');
    cursor: pointer;
}
</style>
