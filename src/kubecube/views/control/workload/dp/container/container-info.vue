<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form>
      <kube-tab
        v-model="model.containers"
        :data-template="getDefaultContainer"
      >
        <template slot-scope="{ model: containerModel, errorPrefix }">
          <kube-form
            label-size="large"
            style="margin-top: 20px"
          >
            <kube-name-input
              v-model="containerModel.containerName"
              label="容器名称"
              :name="`${errorPrefix}-containerName`"
            />

            <validation-provider
              v-slot="{ errors: imageErrors }"
              :name="`${errorPrefix}-imageName`"
              rules="required"
            >
              <kube-form-item
                label="镜像"
                required
                :message="imageErrors && imageErrors[0]"
              >
                <u-input
                  v-model="containerModel.image"
                  size="huge"
                  :color="imageErrors && imageErrors[0] ? 'error' : ''"
                />
              </kube-form-item>
            </validation-provider>
            <resource-config v-model="containerModel.resources" />
            <kube-form-item>
              <u-link @click="containerModel.showAdvanced = !containerModel.showAdvanced">
                {{ containerModel.showAdvanced ? '收起更多配置' : '展开更多配置' }}
              </u-link>
            </kube-form-item>
            <template v-if="containerModel.showAdvanced">
              <volumns-config
                v-model="containerModel.volumes"
                :pod-volumes="model.podTemplate.spec.volumes"
                :open-dialog="openEmpryDirDialog"
                :error-prefix="errorPrefix"
                :storage="model.spec.volumeClaimTemplates && model.spec.volumeClaimTemplates.templates"
              />

              <!-- <kube-form-item
                label="日志目录"
                layout="block"
                description="日志服务将会自动采集以下目录中的日志"
              >
                <u-note slot="label">
                  挂载目录后，可在<u-link @click="openNewWindow({ path: '/control/logconfigs/list', query: $route.query})">
                    日志服务
                  </u-link>配置日志采集任务
                </u-note>
                <path-input
                  v-model="containerModel.log"
                  style="width: 580px"
                  :error-prefix="`${errorPrefix}-exclude`"
                  :rules="{}"
                  placeholder="支持正则匹配，建议排除压缩文件，例如：\.gz$"
                />
              </kube-form-item> -->

              <env-config
                v-model="containerModel.env"
                :containers="model.containers"
                :error-prefix="errorPrefix"
              />
              <kube-form-item label="容器类型">
                <u-note slot="label">
                  init 容器不支持就绪探针，必须可以执行结束。一个 pod 可以有多个 init 容器，它们将依次在业务容器运行前执行。
                </u-note>
                <validation-provider
                  v-slot="{ invalid: ctInvalid }"
                  :name="`${errorPrefix}-containertype`"
                  :rules="{
                    someValueRequired: {
                      list: containerTypeList,
                      needed: 'normal'
                    }
                  }"
                >
                  <u-capsules
                    v-model="containerModel.type"
                    :data="containerTypes"
                  />
                  <u-text
                    v-show="ctInvalid"
                    :class="$style.errTip"
                  >
                    工作负载至少需要设置一个业务容器
                  </u-text>
                </validation-provider>
              </kube-form-item>

              <kube-form-item
                layout="block"
                label="启动命令"
                show-discription
              >
                <div
                  slot="description"
                  style="margin-top: -2px;"
                >
                  常见用法
                  <u-note size="large">
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
                    </div><div style="padding-left: 20px;">
                      while true; do echo hello; sleep 10; done
                    </div>
                  </u-note>
                </div>
                <kube-monaco-editor
                  v-model="containerModel.command"
                  style="height: 160px; width: 580px"
                  language="shell"
                  :option="{ minimap: {enabled: false} }"
                />
              </kube-form-item>

              <kube-form-item
                layout="block"
                label="启动命令参数"
              >
                <kube-monaco-editor
                  v-model="containerModel.args"
                  style="height: 160px; width: 580px"
                  language="shell"
                  :option="{ minimap: {enabled: false} }"
                />
              </kube-form-item>

              <probe-config
                v-model="containerModel.probe.liveness"
                :error-prefix="`${errorPrefix}-liveness`"
                probe="LivenessProbe"
              />

              <probe-config
                v-model="containerModel.probe.readiness"
                :error-prefix="`${errorPrefix}-readiness`"
                probe="ReadyProbe"
              />

              <probe-config
                v-model="containerModel.probe.preStop"
                :error-prefix="`${errorPrefix}-preStop`"
                probe="LifePreStopProbe"
              />
              <probe-config
                v-model="containerModel.probe.postStart"
                :error-prefix="`${errorPrefix}-postStart`"
                probe="LifePostStopProbe"
              />

              <port-config
                v-model="containerModel.ports"
                :error-prefix="`${errorPrefix}-ports`"
              />
              <kube-form-item
                label="镜像拉取策略"
                required
              >
                <u-capsules
                  v-model="containerModel.imagePullPolicy"
                  :data="imagePullPolicyList"
                />
              </kube-form-item>
            </template>
          </kube-form>
        </template>
      </kube-tab>
      <kube-form-item>
        <u-linear-layout direction="horizontal">
          <u-button
            color="primary"
            @click="$emit('go', -1)"
          >
            上一步
          </u-button>
          <u-button
            color="primary"
            :disabled="invalid"
            @click="$emit('go', 1)"
          >
            下一步
          </u-button>
        </u-linear-layout>
      </kube-form-item>
    </kube-form>
    <empty-dir-dialog
      ref="emptyDir"
      :pod-volumes="model.podTemplate.spec.volumes"
      @change="onChangeEmptyDir"
    />
  </validation-observer>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional.js';
import { getDefaultContainer } from 'kubecube/k8s-resources/container';
import resourceConfig from './resource-config.vue';
import volumnsConfig from './volumns-config.vue';
import emptyDirDialog from './volumns/emptydir-dialog.vue';
// import pathInput from 'kubecube/views/control/logseer/edit/components/path-input.vue';
import envConfig from './env-config.vue';
import probeConfig from './probe-config.vue';
import portConfig from './port-config.vue';

export default {
    components: {
        resourceConfig,
        volumnsConfig,
        emptyDirDialog,
        // pathInput,
        envConfig,
        probeConfig,
        portConfig,
    },
    mixins: [ makeVModelMixin ],
    data() {
        return {
            containerTypes: [
                { text: '业务容器', value: 'normal' },
                { text: 'init 容器', value: 'init' },
            ],
            imagePullPolicyList: [
                { value: 'Always', text: 'Always' },
                { value: 'Never', text: 'Never' },
                { value: 'IfNotPresent', text: 'IfNotPresent' },
            ],
        };
    },
    computed: {
        containerTypeList() {
            return this.model.containers.map(c => c.type);
        },
    },
    methods: {
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
    },
};
</script>

<style module>
.errTip {
    color: $brand-error;
    padding-left: 10px;
}
</style>
