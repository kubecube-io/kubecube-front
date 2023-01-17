<template>
  <div style="width:700px">
    <el-form
      ref="form"
      :model="model"
      label-position="right"
      label-width="120px"
    >
      <el-form-item
        label="日志任务名称"
        prop="name"
        :rules="[
          { required: true, message: '名称不能为空' },
          validators.k8sResourceNameValidator(),
        ]"
      >
        <el-input
          v-model="model.name"
          :disabled="isEdit"
          placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"
        />
      </el-form-item>
      <el-form-item label="集群">
        {{ cluster }}
      </el-form-item>
      <el-form-item label="空间">
        {{ namespace }}
      </el-form-item>
      <el-form-item
        label="标签选择器"
        :prop="`labelSelector`"
        :rules="[
          { required: true, message: '不能为空'},
        ]"
      >
        <template slot="label">
          标签选择器
          <el-tooltip
            effect="dark"
            content="通过Label选择指定的工作负载，采集其中的日志"
            placement="right"
            popper-class="kube-el-tooltip-popper"
          >
            <i
              class="el-icon-question"
              style="position: absolute;right:4px;top:11px"
            />
          </el-tooltip>
        </template>
        <workloadLableSelect
          v-model="model.labelSelector"
          :disabled="isEdit"
          :cluster="cluster"
          :namespace="namespace"
          prefix-prop="labelSelector"
        />
      </el-form-item>
      <el-form-item label="采集配置项">
        <dynamicTab
          v-model="model.inputs"
          validate-file="inputs"
          :initial-add="true"
          :min-count="1"
          :mini-formatter="(item, index) => {
            return `配置-${index + 1}`
          }"
          :get-default-item="getDefaultInputItem"
        >
          <template slot-scope="{item, index}">
            <el-form-item
              label="配置项名称"
              :prop="`inputs.${index}.name`"
              :rules="[
                { required: true, message: '名称不能为空'},
                validators.k8sResourceNameValidator(),
              ]"
              :class="$style.inputsFieldItem"
            >
              <el-input
                v-model="item.name"
                :disabled="item.exist"
                placeholder="1-63位小写字母、数字、或中划线组成，以字母开头，字母或数字结尾"
              />
            </el-form-item>
            <el-form-item
              label="日志源类型"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                日志源类型
                <el-tooltip
                  effect="dark"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <template slot="content">
                    容器标准输出：容器中的标准输出流；<br>
                    容器日志：容器内产生的文本日志以及容器的元数据信息
                  </template>
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <el-radio-group
                v-model="item.type"
                @input="(val) => {
                  item.paths = val === 'dockerStdout' ? [ { path: 'stdout' } ] : [];
                }"
              >
                <el-radio label="dockerStdout">
                  容器标准输出
                </el-radio>
                <el-radio label="k8sLogfile">
                  容器日志文件
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="日志采集路径"
              :class="$style.inputsFieldItem"
            >
              <template v-if="item.type === 'dockerStdout'">
                <el-input
                  :value="item.paths[0].path"
                  disabled
                />
              </template>
              <template v-if="item.type === 'k8sLogfile'">
                <pathInput
                  v-model="item.paths"
                  placeholder="输入日志路径或glob表达式"
                  :prefix-prop="`inputs.${index}.paths`"
                  :required="true"
                  :rules="[
                    validators.startsWithSlash(false)
                  ]"
                />
              </template>
            </el-form-item>
            <el-form-item
              label="容器"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                容器
                <el-tooltip
                  effect="dark"
                  content="容器"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <el-input
                v-model="item.containerName"
                placeholder="输入容器名称"
              />
            </el-form-item>
            <el-form-item
              label="元信息/注入Pod标记"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                元信息/自定义标记
                <el-tooltip
                  effect="dark"
                  content="在日志配置中注入Pod的label(标签)、env(环境变量)、annotation(注解)，可用作日志查询页面的筛选条件。"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <matchFieldInput
                v-model="item.matchFields"
                :prefix-prop="`inputs.${index}.matchFields`"
              />
            </el-form-item>
            <el-form-item
              label="元信息/自定义标记"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                元信息/自定义标记
                <el-tooltip
                  effect="dark"
                  content="自定义Key-Value值，可用作日志查询页面的筛选条件"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <labelEditor
                v-model="item.fields"
                :prefix-prop="`inputs.${index}.fields`"
              />
            </el-form-item>
            <el-form-item
              label="日志多行配置"
              :class="$style.inputsFieldItem"
            >
              <div style="display:flex;align-items:center;height:36px">
                <el-switch
                  v-model="item.multiline.active"
                  style="margin-right:8px"
                />
                <el-input
                  v-if="item.multiline.active"
                  v-model="item.multiline.pattern"
                  placeholder="输入匹配多行的正则表达式"
                />
              </div>
            </el-form-item>
            <el-form-item
              label="排除日志 "
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                排除日志
                <el-tooltip
                  effect="dark"
                  content="该路径下的文件将被忽略，日志内容不被收集"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <pathInput
                v-model="item.excludeFiles"
                placeholder="支持正则匹配，建议排除压缩文件，例如：\.gz$"
                :prefix-prop="`inputs.${index}.excludeFiles`"
              />
            </el-form-item>
            <el-form-item
              label="忽略日志文件时长  "
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                忽略日志文件时长
                <el-tooltip
                  effect="dark"
                  content="将忽略日志任务创建时间起对应时间段内的日志文件"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <el-input-number
                v-model="item.ignoreOlder.num"
                controls-position="right"
                :min="0"
                :step="1"
                step-strictly
                style="width:160px"
              />
              <span style="margin-left: 8px">小时</span>
            </el-form-item>
            <el-form-item
              label="日志保留"
              :class="$style.inputsFieldItem"
            >
              <span style="margin-right: 8px">保留时间</span>
              <el-input-number
                v-model="item.cleanLogs.retainDays"
                controls-position="right"
                :min="0"
                :step="1"
                step-strictly
                style="width:160px"
              />
              <span style="margin-left: 8px">天</span>
            </el-form-item>
          </template>
        </dynamicTab>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submit"
        >
          {{ isEdit ? '立即更新' : '立即创建' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import { LOG_TYPE } from 'kubecube/utils/constance';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toLogconfgPlainObject,
    toModifyObject as toLogconfigObject,
} from 'kubecube/k8s-resources/logconfigs-new';
import { toObjectArray } from 'kubecube/k8s-resources/base/utils.js';
import pathInput from './components/path-input.vue';
import metaPodInput from './components/meta-pod-input.vue';
import multilineInput from './components/multiline-input.vue';
const demoImg = require('./demo.png');
import * as validators from 'kubecube/utils/validators';
import workloadLableSelect from './components/workload-lable-select.vue';
import dynamicTab from 'kubecube/elComponent/dynamic-tab.vue';
import dynamicBlock from 'kubecube/elComponent/dynamic-block/index.vue';
import matchFieldInput from './components/match-field-input.vue';
import labelEditor from 'kubecube/elComponent/label-editor.vue';
import logseerService from 'kubecube/services/logseer';
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
        workloadLableSelect,
        dynamicTab,
        dynamicBlock,
        matchFieldInput,
        labelEditor,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            model: this.instance || toLogconfgPlainObject(),
            validators,
            submitLoading: false,
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
        getDefaultInputItem() {
            return {
                name: '',
                type: 'dockerStdout',
                paths: [
                    {
                        path: 'stdout',
                    },
                ],
                containerName: '',
                matchFields: [], // 元信息/注入Pod标记
                fields: [], // 元信息/自定义标记
                multiline: {
                    active: false,
                    pattern: '',
                },
                ignoreOlder: {
                    num: '24',
                    unit: 'h',
                },
                excludeFiles: [],
                cleanLogs: {
                    retainDays: 1,
                },
            };
        },
        async submit() {
            // 触发校验
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            const logconfig = toLogconfigObject(this.model);
            console.log(logconfig);
            this.submitLoading = true;
            try {
                if (this.isEdit) {
                    const res = await logseerService.updateLogconfig({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            name: this.instance.name,
                        },
                        data: logconfig,
                    });
                } else {
                    const res = await logseerService.createLogconfig({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                        },
                        data: logconfig,
                    });
                }
            } catch (error) {
                this.submitLoading = false;
                return;
            }
            this.$router.push({ path: '/control/logconfigs/list' });
        },
    },
};
</script>

<style module>
.inputsFieldItem {
  margin-bottom: 22px !important;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.inputsFieldItem :global(.el-form-item__content) {
  margin-left: 0px !important;
  width: 100% !important;
}
.inputsFieldItem :global(.el-form-item__label) {
  width: auto !important;
}
</style>
