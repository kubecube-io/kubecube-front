<template>
  <kube-form-item
    layout="block"
    :label="probeMapping[probe]"
  >
    <u-switch
      v-model="model.enable"
      width="wide"
      :with-text="true"
    />
    <template v-if="model.enable">
      <kube-form
        label-size="normal"
        style="width: 580px"
      >
        <template v-if="['LivenessProbe', 'ReadyProbe'].includes(probe)">
          <kube-form-item label="故障阈值">
            <u-number-input
              v-model="model.failureThreshold"
              size="huge normal"
              :default-value="3"
              :min="1"
            /> 次
          </kube-form-item>
          <kube-form-item label="健康阈值">
            <u-number-input
              v-model="model.successThreshold"
              size="huge normal"
              :default-value="3"
              :min="1"
            /> 次
          </kube-form-item>
          <kube-form-item label="初始等待时间">
            <u-number-input
              v-model="model.initialDelaySeconds"
              size="huge normal"
              :default-value="3"
              :min="1"
            /> 秒
          </kube-form-item>
          <kube-form-item label="监测间隔时间">
            <u-number-input
              v-model="model.periodSeconds"
              size="huge normal"
              :default-value="3"
              :min="1"
            /> 秒
          </kube-form-item>
          <kube-form-item label="检测超时时间">
            <u-number-input
              v-model="model.timeoutSeconds"
              size="huge normal"
              :default-value="3"
              :min="1"
            /> 秒
          </kube-form-item>
        </template>
        <kube-form-item label="检测方式">
          <u-capsules
            v-model="model.method"
            :data="types"
          />
        </kube-form-item>

        <validation-provider
          v-if="model.method === 'exec'"
          v-slot="{ errors }"
          :name="`${prefixKey}-exec`"
          rules="required"
        >
          <kube-form-item
            :message="errors && errors[0]"
            label="执行脚本"
            layout="block"
            required
          >
            <kube-monaco-editor
              v-model="model.command"
              style="height: 160px; width: 580px"
              language="shell"
              :option="{ minimap: {enabled: false} }"
            />
          </kube-form-item>
        </validation-provider>

        <template v-else>
          <kube-form-item label="Host">
            <u-input
              v-model="model.host"
              size="huge"
            />
          </kube-form-item>

          <validation-provider
            v-if="model.method === 'httpGet'"
            v-slot="{ errors }"
            :name="`${prefixKey}-exec`"
            rules="required|startsWithSlash|ConsistofPath"
          >
            <kube-form-item
              label="Path"
              :message="errors && errors[0]"
              required
            >
              <u-input
                v-model="model.path"
                :color="errors && errors[0] ? 'error' : ''"
                size="huge"
              />
            </kube-form-item>
          </validation-provider>

          <kube-form-item label="Port">
            <u-number-input
              v-model="model.port"
              size="huge normal"
              :min="1"
              :max="65535"
            />
          </kube-form-item>

          <kube-form-item
            v-if="model.method === 'httpGet'"
            label="Header"
            layout="block"
          >
            <kube-dynamic-block
              v-model="model.httpHeaders"
              style="width: 100%;"
              :data-template="getDataTemplate"
            >
              <template slot="column">
                <th>Name</th>
                <th>Value</th>
              </template>
              <template slot-scope="{ model: httpModel }">
                <td>
                  <u-input
                    v-model="httpModel.name"
                    size="huge"
                  />
                </td>
                <td>
                  <u-input
                    v-model="httpModel.value"
                    size="huge"
                  />
                </td>
              </template>
            </kube-dynamic-block>
          </kube-form-item>
        </template>
      </kube-form>
    </template>
  </kube-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubecube/mixins/functional';
const probeMapping = {
    LivenessProbe: '存活探针',
    ReadyProbe: '就绪探针',
    LifePreStopProbe: '生命周期-停止前',
    LifePostStopProbe: '生命周期-启动后',
};
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
        probe: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            probeMapping,
            types: [
                { value: 'exec', text: '脚本' },
                { value: 'httpGet', text: 'HTTP' },
                { value: 'tcpSocket', text: 'TCP' },
            ],
        };
    },
    methods: {
        getDataTemplate() {
            return {
                name: '',
                value: '',
            };
        },
    },
};
</script>

<style>

</style>
