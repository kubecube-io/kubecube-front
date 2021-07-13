<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form ref="form">
      <kube-name-input
        v-model="model.metadata.name"
        :disabled="isEdit"
      />

      <kube-form-item
        label="日志源类型"
        layout="block"
      >
        <span slot="label">
          <u-note>容器标准输出：容器中的标准输出流；<br> 容器日志：容器内产生的文本日志以及容器的元数据信息</u-note>
        </span>
        <u-radios
          v-model="model.type"
          :disabled="isEdit"
        >
          <u-radio
            v-for="l in logTypeList"
            :key="l.label"
            :label="l.label"
          >
            {{ l.text }}
          </u-radio>
        </u-radios>
      </kube-form-item>

      <kube-form-item
        label="标签选择器"
        layout="block"
      >
        <span slot="label">
          <u-note>通过Label选择指定的工作负载，采集其中的日志<br>如需关联多个工作负载，请使用高级模式。</u-note>
        </span>
        <kube-label-editor
          v-model="model.metadata.labels"
          :disabled="isEdit"
          prefix-key="label-"
          style="width: 580px"
        />
      </kube-form-item>

      <kube-form-item v-if="model.type === 'dockerStdout'">
        <u-link @click="showAdvanceConfig = !showAdvanceConfig">
          {{ showAdvanceConfig ? '收起高级配置': '展开高级配置' }}
        </u-link>
      </kube-form-item>
      <template v-if="showAdvanceConfig">
        <kube-form-item
          label="采集配置项"
          layout="block"
        >
          <kube-tab
            v-model="model.inputs"
            :show-tabs="model.type !== 'dockerStdout'"
            :data-template="getDefaultAdvancedBody"
          >
            <template slot-scope="{ model: inputsModel, errorPrefix }">
              <kube-form style="width: 580px;margin-top: 20px;">
                <template v-if="model.type === 'k8sLogfile'">
                  <kube-form-item
                    layout="list"
                    label="日志采集路径"
                    required
                  >
                    <path-input
                      v-model="inputsModel.paths"
                      :error-prefix="`${errorPrefix}-path`"
                      :rules="{
                        required: true,
                        startsWithSlash: true,
                        ConsistofGlob: true,
                      }"
                      placeholder="输入日志路径或glob表达式"
                    />
                  </kube-form-item>
                  <kube-form-item layout="none">
                    <u-link @click="showAdvanceConfigInDetail = !showAdvanceConfigInDetail">
                      {{ showAdvanceConfigInDetail ? '收起高级配置': '展开高级配置' }}
                    </u-link>
                  </kube-form-item>
                </template>
                <template v-if="showAdvanceConfigInDetail || model.type === 'dockerStdout'">
                  <kube-form-item
                    layout="list"
                    label="容器"
                  >
                    <u-input
                      v-model="inputsModel.containerName"
                      size="huge"
                      placeholder="输入容器名称containername"
                    />
                  </kube-form-item>
                  <kube-form-item
                    layout="list"
                    label="元信息/注入Pod标记"
                  >
                    <span slot="label">
                      <u-note>在日志配置中注入Pod的label(标签)、env(环境变量)、annotation(注解)，可用作日志查询页面的筛选条件。</u-note>
                    </span>
                    <meta-pod-input
                      v-model="inputsModel.matchFields"
                      :error-prefix="`${errorPrefix}-metapod`"
                    />
                  </kube-form-item>

                  <kube-form-item
                    layout="list"
                    label="元信息/自定义标记"
                  >
                    <span slot="label">
                      <u-note>自定义Key-Value值，可用作日志查询页面的筛选条件</u-note>
                    </span>
                    <kube-label-editor
                      v-model="inputsModel.fields"
                      :prefix-key="`${errorPrefix}-fields-`"
                    />
                  </kube-form-item>

                  <kube-form-item
                    layout="list"
                    label="日志多行配置"
                  >
                    <span slot="label">
                      <u-note>
                        日志多行配置用于指定处理跨多行消息的处理方式。<br>
                        pattern：指定用于匹配多行的正则表达式；<br>
                        negate：定义模式是否被否定；<br>
                        match：指定如何把多行合并成一个事件。<br>
                        <u-link @click="demoshow = true">查看示例</u-link>
                      </u-note>
                    </span>
                    <multiline-input v-model="inputsModel.multiline" />
                  </kube-form-item>

                  <kube-form-item
                    label="单条日志大小上限"
                    layout="list"
                  >
                    <u-linear-layout direction="horizontal">
                      <u-number-input v-model="inputsModel.maxBytes" />
                      <u-text>bytes</u-text>
                    </u-linear-layout>
                  </kube-form-item>

                  <kube-form-item
                    layout="list"
                    label="排除日志"
                  >
                    <span slot="label">
                      <u-note>该路径下的文件将被忽略，日志内容不被收集</u-note>
                    </span>
                    <path-input
                      v-model="inputsModel.excludeFiles"
                      :error-prefix="`${errorPrefix}-exclude`"
                      :rules="{}"
                      placeholder="支持正则匹配，建议排除压缩文件，例如：\.gz$"
                    />
                  </kube-form-item>

                  <kube-form-item
                    label="忽略日志文件时长"
                    layout="list"
                  >
                    <span slot="label">
                      <u-note>将忽略日志任务创建时间起对应时间段内的日志文件</u-note>
                    </span>
                    <u-linear-layout direction="horizontal">
                      <u-number-input v-model="inputsModel.ignore_older" />
                      <u-text>小时</u-text>
                    </u-linear-layout>
                  </kube-form-item>

                  <kube-form-item
                    label="日志保留"
                    layout="list"
                  >
                    <u-linear-layout direction="horizontal">
                      <u-select v-model="inputsModel.retainMode">
                        <u-select-item value="retainNum">
                          保留文件数
                        </u-select-item>
                        <u-select-item value="retainDays">
                          保留时间
                        </u-select-item>
                      </u-select>
                      <u-number-input v-model="inputsModel.cleanLogs[inputsModel.retainMode]" />
                      <u-text>{{ inputsModel.retainMode | retainModeUnit }}</u-text>
                    </u-linear-layout>
                  </kube-form-item>
                </template>
              </kube-form>
            </template>
          </kube-tab>
        </kube-form-item>
      </template>
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
    <u-modal
      :visible.sync="demoshow"
      title="查看示例"
      size="huge"
      ok-button=""
      cancel-button=""
    >
      <div>
        <img :src="demoImg">
      </div>
    </u-modal>
  </validation-observer>
</template>

<script>
import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import { LOG_TYPE } from 'kubecube/utils/constance';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toLogconfgPlainObject,
    getDefault as getDefaultAdvancedBody,
    toK8SObject as toLogconfigK8SObject,
    patchK8SObject as toPatchLogconfigObject,
} from 'kubecube/k8s-resources/logconfigs';
import { toObjectArray } from 'kubecube/k8s-resources/base/utils.js';
import pathInput from './components/path-input.vue';
import metaPodInput from './components/meta-pod-input.vue';
import multilineInput from './components/multiline-input.vue';
const demoImg = require('./demo.png');
export default {
    filters: {
        retainModeUnit(val) {
            if (val === 'retainNum') return '个';
            if (val === 'retainDays') return '天';
            return '';
        },
    },
    components: {
        pathInput,
        metaPodInput,
        multilineInput,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            model: cloneDeep(this.instance) || toLogconfgPlainObject(),
            logTypeList: [ 'dockerStdout', 'k8sLogfile' ].map(k => ({ label: k, text: LOG_TYPE[k] })),
            showAdvanceConfig: false,
            showAdvanceConfigInDetail: false,
            demoshow: false,
            demoImg,
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
        'model.type': function(val) {
            if (val !== 'dockerStdout') {
                this.showAdvanceConfig = true;
            }
        },
    },
    created() {
        if (this.isEdit) {
            this.showAdvanceConfig = true;
            this.showAdvanceConfigInDetail = true;
        }
    },
    methods: {
        toKeyList(data) {
            return toObjectArray(getFunc(data, 'labelSelectorKey') || {}, 'text', 'value');
        },
        getDefaultAdvancedBody,
        async submit() {
            if (this.isEdit) {
                const yaml = toPatchLogconfigObject(this.model);

                await workloadService.modifyNeteaseResource({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'logconfigs',
                        name: this.instance.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toLogconfigK8SObject(this.model);
                await workloadService.createNeteaseResource({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'logconfigs',
                    },
                    data: yaml,
                });
            }

            this.$router.push({ path: '/control/logconfigs/list' });
        },
    },
};
</script>

<style>

</style>
