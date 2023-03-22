<template>
  <div>
    <el-form ref="form" :model="model" :rules="rules" label-position="right" label-width="140px">
      <dynamicTab
        v-model="model.containers"
        validateFile="containers"
        :initialAdd="true"
        :minCount="1"
        :miniFormatter="(item, index) => {
          return `配置-${index + 1}`
        }"
        :getDefaultItem="getDefaultContainer"
      >
      <template slot-scope="{item, index}">
        <el-form-item
          label="容器名称"
          :prop="`containers.${index}.containerName`"
          :rules="[
            { required: true, message: '名称不能为空'},
            validators.k8sResourceNameValidator(),
          ]"
        >
          <el-input v-model="item.containerName" placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"/>
        </el-form-item>
        <el-form-item
          label="镜像"
          :prop="`containers.${index}.image`"
          :rules="[
            { required: true, message: '镜像不能为空'},
          ]"
        >
          <div style="display:flex">
            <el-input v-model="item.image"/>
          </div>
        </el-form-item>
        <div style="position:relative">
          <x-request
            ref="request"
            :service="resourceQuotaService"
            :params="{
              namespaceInfo,
              cluster,
              tenant,
              project
            }"
          > 
          <template slot-scope="{ data }">
            <div :class="$style.remainResourceInfo">
              <template v-if="data">
                <div :class="$style.remainType">
                  空间配额剩余:
                </div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    请求:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: {{data.requests.cpu}} Cores</span><span :class="$style.value">内存: {{data.requests.memory}} MiB</span><span :class="$style.value">GPU: {{data.requests.gpu}} Cores</span>
                  </div>
                </div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    上限:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: {{data.limits.cpu}} Cores</span><span :class="$style.value">内存: {{data.limits.memory}} MiB</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div>空间配额剩余</div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    请求:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: -- Cores</span><span :class="$style.value">内存: -- MiB</span><span :class="$style.value">GPU: -- GiB</span>
                  </div>
                </div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    上限:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: -- Cores</span><span :class="$style.value">内存: -- MiB</span>
                  </div>
                </div>
              </template>
            </div>
          </template>
          </x-request>
        </div>
        <resource-config v-model="item.resources" />
        <el-form-item>
          <el-link @click="item.showAdvanced = !item.showAdvanced" type="primary">
            {{ item.showAdvanced ? '收起更多配置' : '展开更多配置' }}
          </el-link>
        </el-form-item>
        <div v-show="item.showAdvanced">
          <volumns-config
            v-model="item.volumes"
            :pod-volumes="model.podTemplate.spec.volumes"
            :open-dialog="openEmpryDirDialog"
            :error-prefix="`containers.${index}.volumes`"
            :storage="model.spec.volumeClaimTemplates && model.spec.volumeClaimTemplates.templates"
            :image="item.image"
          />
          <env-config
            v-model="item.env"
            :containers="model.containers"
            :error-prefix="`containers.${index}.env`"
          />
          <el-form-item
            :prop="`containers.${index}.type`"
            :rules="[
              validators.someValueRequired(containerTypeList, 'normal'),
            ]"
          >
            <template slot="label">
              容器类型
              <el-tooltip effect="dark" content="init 容器不支持就绪探针，必须可以执行结束。一个 pod 可以有多个 init 容器，它们将依次在业务容器运行前执行。" placement="right" popper-class="ncs-el-tooltip-popper">
                <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
              </el-tooltip>
            </template>
            <el-radio-group v-model="item.type">
              <el-radio-button v-for="typeItem in containerTypes" :label="typeItem.value" :key="typeItem.value">{{typeItem.text}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="启动命令"
          >
            <div style="color: #999;">
              常见用法
              <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
                <div slot="content">
                  <div>1.使用环境变量</div>
                    <div>【命令】/bin/echo</div>
                    <div>【参数】$(ENVNAME)</div>
                    <div>注：ENVNAME为环境变量中定义的Key值</div>
                    <div style="margin-top: 10px;">
                      2.运行shell命令
                    </div>
                    <div>【命令】/bin/sh</div>
                    <div>【参数】</div><div style="padding-left: 20px;">
                      -c
                    </div>
                    <div style="padding-left: 20px;">
                      while true; do echo hello; sleep 10; done
                    </div>
                </div>
                <i class="el-icon-question"/>
              </el-tooltip>
            </div>
            <qz-editor
              style="border: 1px solid #E1E8ED"
              height="160"
              width="580"
              v-model="item.command"
              theme="vs"
              language="shell"
              :options="{ minimap: {enabled: false} }"
            />
          </el-form-item>
          <el-form-item
            label="启动命令参数"
          >
            <qz-editor
              style="border: 1px solid #E1E8ED"
              height="160"
              width="580"
              v-model="item.args"
              theme="vs"
              language="shell"
              :options="{ minimap: {enabled: false} }"
            />
          </el-form-item>
          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.liveness"
            :prefixKey="`containers.${index}.probe.liveness`"
            probe="LivenessProbe"
            key="LivenessProbe"
          />
          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.readiness"
            :prefixKey="`containers.${index}.probe.readiness`"
            probe="ReadyProbe"
            key="ReadyProbe"
          />

          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.preStop"
            :prefixKey="`containers.${index}.probe.preStop`"
            probe="LifePreStopProbe"
            key="LifePreStopProbe"
          />
          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.postStart"
            :prefixKey="`containers.${index}.probe.postStart`"
            probe="LifePostStopProbe"
            key="LifePostStopProbe"
          />
          <port-config
            v-model="item.ports"
            :prefixKey="`containers.${index}.ports`"
            key="ports"
          />
          <el-form-item
            :prop="`containers.${index}.imagePullPolicy`"
            :rules="[
              { required: true, message: '镜像拉取策略不能为空'},
            ]"
          >
            <template slot="label">
              镜像拉取策略
              <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
                <div slot="content">
                  Always：总是重新拉取新镜像<br/>
                  Never： 永远不会拉取新镜像<br/>
                  IfNotPresent：默认值，镜像在宿主机上不存在时才拉取
                </div>
                <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
              </el-tooltip>
            </template>
            <el-radio-group v-model="item.imagePullPolicy">
              <el-radio-button v-for="policy in imagePullPolicyList" :label="policy.value" :key="policy.value">{{policy.text}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>
      </template>
      </dynamicTab>
      <el-form-item>
        <el-button type="primary" @click="$emit('go', -1)">上一步</el-button>
        <el-button type="primary" @click="handleNextStep">下一步</el-button>
      </el-form-item>
    </el-form>
    <empty-dir-dialog
      ref="emptyDir"
      :pod-volumes="model.podTemplate.spec.volumes"
      @change="onChangeEmptyDir"
    />
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import { getDefaultContainer } from 'kubecube/k8s-resources/container';
import resourceConfig from './resource-config.vue';
import volumnsConfig from './volumns-config.vue';
import emptyDirDialog from './volumns/emptydir-dialog.vue';
import envConfig from './env-config.vue';
import probeConfig from './probe-config.vue';
import portConfig from './port-config.vue';
import { get, sync } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toResourceQuotaPlainObject,
} from 'kubecube/k8s-resources/resourceQuota/index.js';
import dynamicTab from 'kubecube/elComponent/dynamic-tab.vue/index.vue';
import * as validators from 'kubecube/utils/validators';

export default {
    components: {
        resourceConfig,
        volumnsConfig,
        emptyDirDialog,
        // pathInput,
        envConfig,
        probeConfig,
        portConfig,
        dynamicTab,
    },
    mixins: [ makeVModelMixin ],
    data() {
        return {
            validators,
            rules: {

            },
            containerTypes: [
                { text: '业务容器', value: 'normal' },
                { text: 'init 容器', value: 'init' },
            ],
            imagePullPolicyList: [
                { value: 'Always', text: 'Always' },
                { value: 'Never', text: 'Never' },
                { value: 'IfNotPresent', text: 'IfNotPresent' },
            ],
            showSelectImageModal: false,
            currentContainerModel: null,
        };
    },
    computed: {
        containerTypeList() {
            return this.model.containers.map(c => c.type);
        },
        cluster: get('scope/cluster@value'),
        tenant: sync('scope/tenant@value'),
        project: sync('scope/project@value'),
        namespaceInfo: sync('scope/namespace@metadata'),
        clusterHarborAddr: get('scope/cluster@harborAddr'),
    },
    methods: {
        async handleNextStep() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.$emit('go', 1);
        },
        getDefaultContainer,
        onChangeEmptyDir(list) {
            this.$set(this.model.podTemplate.spec.volumes, 'emptyDir', list);
        },
        openEmpryDirDialog() {
            this.$refs.emptyDir.open();
        },
        openNewWindow(link) {
            const routeData = this.$router.resolve(link);
            window.open(routeData.href, '_blank');
        },
        handleValidate() {
            this.$refs.observer.validate();
        },
        openSelectImageModal(containerModel) {
            this.currentContainerModel = containerModel;
            this.showSelectImageModal = true;
        },
        changeCurrentContainerModelImage(val) {
            this.currentContainerModel.image = val;
        },
        async resourceQuotaService(params) {
            const { namespaceInfo, cluster, tenant, project } = params;
            if (namespaceInfo && cluster && tenant && project) {
                const namespace = namespaceInfo.name;
                const res = await workloadService.getAPIV1Instance({
                    pathParams: {
                        cluster,
                        namespace,
                        resource: 'resourcequotas',
                        name: `${cluster}.${tenant}.${project}.${namespace}`,
                    },
                    noAlert: true,
                });
                if (res.kind === 'ResourceQuota') {
                    const status = toResourceQuotaPlainObject(res).status;
                    console.log(status);
                    return {
                        requests: {
                            cpu: (status.hard.cpu - status.used.cpu).toFixed(2),
                            memory: (status.hard.memory - status.used.memory).toFixed(2),
                            gpu: (status.hard.gpu - status.used.gpu).toFixed(2),
                        },
                        limits: {
                            cpu: (status.hard.limitsCpu - status.used.limitsCpu).toFixed(2),
                            memory: (status.hard.limitsMemory - status.used.limitsMemory).toFixed(2),
                        },
                    };
                }
                return null;
            }
        },
    },
};
</script>

<style module>
.errTip {
    color: $brand-error;
    padding-left: 10px;
}
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubecube/assets/question.svg');
    cursor: pointer;
}
.selectImageBtn{
  margin-left: 8px;
}

.remainResourceInfo{
    min-width: 230px;
    background: inherit;
    background-color: rgba(247, 248, 253, 1);
    position: absolute;
    top: 40px;
    left: 750px;
    padding: 14px;
    font-size: 14px;
    /* display: flex;
    flex-direction: column;
    justify-content: space-between; */
}
.remainResourceInfo .remainType {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
.remainResourceInfo .remainType .title {
  flex-grow: 0;
  flex-shrink: 0;
}
.remainResourceInfo .remainType .content {

}
.value {
    display: inline-block;
    padding: 0 8px;
}
</style>
