<template>
  <div>
    <el-dialog
      title="YAML 编排"
      width="800px"
      :visible.sync="show"
      @close="close"
      :close-on-click-modal="false"
    >
      <template v-if="show">
        <el-alert
          v-if="uploadErrorTip"
          :title="uploadErrorTip"
          type="warning"
          show-icon
          :closable="false"
        />
        <div style="margin-bottom: 20px">
          <div style="display: flex; justify-content: flex-end">
            <u-uploader
              :class="$style.uploader"
              :extensions="['yaml', 'yml']"
              @before-send="onUpload($event)"
              @error="uploadError($event)"
            >
              <el-button icon="el-icon-download">
                从文件导入
              </el-button>
            </u-uploader>
            <el-button
              style="margin-left: 12px"
              icon="el-icon-plus"
              @click="showResourceModal = true"
            >
              从已有资源导入
            </el-button>
          </div>
        </div>
        <div
          v-if="!fullScreen"
          :class="$style.editor"
        >
          <div :class="$style.header">
              <div @click="handleChangeFullScreen">
                <i style="cursor: pointer" :class="fullScreen ? 'el-icon-close' : 'el-icon-full-screen'"/>
              </div>
          </div>
          <qz-editor
            style="border: 1px solid #E1E8ED"
            ref="yamlEdit"
            :value="yamlContent"
            theme="vs"
            language="yaml"
            :options="{ minimap: {enabled: true}, readOnly }"
            @change="handleEditorChange"
          />
        </div>
      </template>
      <div slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button :disabled="!!readOnly" @click="submit" :loading="commitLoading">预检测</el-button>
        <el-button type="primary" :disabled="!!readOnly" @click="submit" :loading="commitLoading">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="showResourceModal"
      title="已有资源导入"
      :close-on-click-modal="false"
    >
      <el-form label-width="120px">
        <el-form-item label="资源类型">
          <el-select
            v-model="model.kind"
            filterable
          >
            <el-option
              v-for="item in kinds"
              :key="item.value"
              :label="item.text"
              :value="item.value"
              :title="item.text"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="实例">
          <i v-if="model.loading" class="el-icon-loading" style="font-size: 24px"/>
          <template v-else>
            <el-select
              v-if="model.instance.length"
              key="list"
              v-model="model.target"
            >
              <el-option
                v-for="item in model.instance"
                :key="item.value"
                :label="item.text"
                :value="item.value"
                :title="item.text"
              />
            </el-select>
            <el-input
              v-else
              key="none"
              disabled
              placeholder="暂无选项"
            />
          </template>
        </el-form-item>
        <!-- <u-submit-button
          v-if="!readOnly"
          :click="loadResource.bind(this)"
          place="middle"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button @click="showResourceModal = false">
                取消
              </u-button>
              <u-button
                color="primary"
                :disabled="model.instance.length === 0 || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                确定
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button> -->
      </el-form>
      <div slot="footer">
        <el-button @click="showResourceModal = false">取 消</el-button>
        <el-button :disabled="model.instance.length === 0" type="primary" @click="loadResource" :loading="resourceLoading">确 定</el-button>
      </div>
    </el-dialog>
    <div v-if="fullScreen" :class="$style.fullScreenEditor">
      <div :class="$style.header">
          <div @click="handleChangeFullScreen">
            <i style="cursor: pointer" :class="fullScreen ? 'el-icon-close' : 'el-icon-full-screen'"/>
          </div>
      </div>
      <qz-editor
        style="border: 1px solid #E1E8ED"
        ref="yamlEdit"
        :value="yamlContent"
        theme="vs"
        language="yaml"
        :options="{ minimap: {enabled: true}, readOnly }"
        @change="handleEditorChange"
      />
    </div>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import { debounce, cloneDeep, get as getFunc } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import yamljs from 'yamljs';
import YAML from 'yaml';
import {
    configs,
    getAPIKeyWork,
} from './utils';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
const defaultOption = {
    language: 'yaml',
    theme: 'lightvs',
    automaticLayout: true,
};
export default {
    mixins: [ Modal ],
    data() {
        return {
            title: '',
            option: {},
            yamlErrorTip: '',
            yamlContent: '',
            oldYamlContent: '',
            readOnly: false,

            uploadErrorTip: false,
            showResourceModal: false,

            kinds: Object.keys(configs).map(k => ({ text: k, value: k })),

            model: {
                loading: false,
                kind: 'Deployment',
                instance: [],
                target: null,
            },
            isPreview: false,
            fullScreen: false,
            resourceLoading: false,
            commitLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                },
                params: {
                    pageSize: 10000,
                },
            };
        },
    },
    watch: {
        uploadErrorTip(value) {
            value && (this.uploadTimeoutId = window.setTimeout(() => {
                this.uploadErrorTip = '';
            }, 3000));
        },
        showResourceModal(val) {
            if (val) {
                this.requestResource();
            }
        },
        'model.kind': function() {
            this.requestResource();
        },
    },
    destroyed() {
        this.uploadTimeoutId && clearTimeout(this.uploadTimeoutId);
        this.validateTimeoutId && clearTimeout(this.validateTimeoutId);
    },
    methods: {
        handleChangeFullScreen() {
            this.fullScreen = !this.fullScreen;
        },
        handleEditorChange(value) {
            if (this.validateTimeoutId) {
                clearTimeout(this.validateTimeoutId);
                this.validateTimeoutId = null;
            }
            this.validateTimeoutId = window.setTimeout(() => {
                this.yamlContent = value;
                try {
                // 重置
                    this.yamlErrorTip = '';
                    yamljs.parse(value);
                } catch (err) {
                    console.log(err);
                    // 二次校验
                    try {
                        YAML.parse(value);
                    } catch (e) {
                        const { parsedLine, snippet } = err;
                        this.yamlErrorTip = `第${parsedLine}行解析错误："${snippet}"`;
                    }
                }
            }, 300);
        },
        async requestResource() {
            this.model.loading = true;
            const keyword = getAPIKeyWork(configs[this.model.kind]);
            const p = cloneDeep(this.requestParam);
            Object.assign(p.pathParams, configs[this.model.kind]);
            const response = await workloadService[`get${keyword}`](p);
            const list = (response.items || []).map(toMetadataPlainObject).map(metadata => {
                return {
                    text: metadata.name,
                    value: metadata.name,
                    ...metadata,
                };
            });
            setValueIfListNotPresent({
                list,
                path: 'value',
                current: this.model.target,
            }, val => {
                this.model.target = val && val.value;
            });
            this.model.instance = list;
            this.model.loading = false;
        },
        async loadResource() {
            this.resourceLoading = true;
            try {
                const keyword = getAPIKeyWork(configs[this.model.kind]);
                const p = cloneDeep(this.requestParam);
                Object.assign(p.pathParams, configs[this.model.kind], {
                    name: this.model.target,
                });
                const response = await workloadService[`get${keyword}Instance`](p);
                this.yamlContent = yamljs.stringify(response, 20, 2);
                this.$refs.yamlEdit.setValue(this.yamlContent);
                this.showResourceModal = false;
            } catch (error) {
                console.log(error);
            }
            this.resourceLoading = false;
        },
        open() {
            this.show = true;
        },
        onUpload(event) {
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsText(event.file);
            this.uploadErrorTip = '';
            reader.onload = e => {
                this.$refs.yamlEdit.setValue(e.target.result);
                // this.editor.getModel().setValue();
            };
        },
        uploadError(e) {
            this.uploadErrorTip = e.name === 'ExtensionError' ? `只能上传 ${e.extensions.join(', ')} 类型的文件！` : e.message;
        },
        async preview() {
            try {
                if (!this.isPreview) {
                    this.oldYamlContent = this.yamlContent;
                    // let content = this.editor.getModel().getValue();
                    // const content = yamljs.parse(this.yamlContent);
                    const content = YAML.parse(this.yamlContent);
                    const response = await workloadExtendService.deploy({
                        pathParams: {
                            cluster: this.cluster,
                        },
                        params: {
                            dryRun: true,
                        },
                        data: content,
                    });
                    this.yamlContent = yamljs.stringify(response, 20, 2);
                    // const ctnt = yamljs.stringify(response, 20, 2);
                    // this.editor.getModel().setValue(ctnt);
                    // const editorOp = Object.assign({}, defaultOption, {
                    //     readOnly: true,
                    // });
                    this.readOnly = true;
                    // this.editor.updateOptions(editorOp);
                    this.isPreview = true;

                } else {
                    this.yamlContent = this.oldYamlContent;
                    // this.editor.getModel().setValue(this.oldYamlContent);
                    // const editorOp = Object.assign({}, defaultOption, {
                    //     readOnly: false,
                    // });
                    this.readOnly = false;
                    // this.editor.updateOptions(editorOp);
                    this.isPreview = false;

                }
            } catch (error) {
                this.yamlErrorTip = error.message;
            }

        },
        async submit(dryRun) {
            this.commitLoading = true;
            try {
                this.yamlErrorTip = '';
                // let content = this.editor.getModel().getValue();
                let content = this.yamlContent;

                // content = yamljs.parse(content);
                content = YAML.parse(content);

                await workloadExtendService.deploy({
                    pathParams: {
                        cluster: this.cluster,
                    },
                    params: {
                        ...(dryRun === true ? { dryRun: true } : {}),
                    },
                    data: content,
                    noAlert: true,
                });
                if (dryRun === true) {
                    this.$toast.success('预检测成功');
                } else {
                    this.close();
                }
            } catch (err) {
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.commitLoading = false;
        },
    },
};
</script>

<style module>
.editor{
  position: relative;
  padding-top: 30px;
  height: 60vh;
  margin-bottom: 20px;
}
.editor .header{
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  background: #F5F7FA;
  display: flex;
  padding: 8px;
  justify-content: flex-end
}
.fullScreenEditor {
  padding-top: 30px;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10000;
}
.fullScreenEditor .header{
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  background: #F5F7FA;
  display: flex;
  padding: 8px;
  justify-content: flex-end;
}

.uploadErrorTip[class] {
    position: absolute;
    top: -26px;
    right: 47px;
    border: transparent;
}
.uploadErrorTip > span, .yamlErrorTip > span { color: $brand-error; }
.download {
    font-size: 16px;
    vertical-align: middle;
    padding-right: 5px;
}
</style>
