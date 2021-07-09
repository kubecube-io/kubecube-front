<template>
  <u-modal
    title="YAML 编排"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <div style="margin-bottom: 20px">
      <u-linear-layout
        style="position: relative;"
        justify="end"
      >
        <u-notice
          v-show="uploadErrorTip"
          icon="error"
          color="error"
          :class="$style.uploadErrorTip"
        >
          {{ uploadErrorTip }}
        </u-notice>
        <u-uploader
          :class="$style.uploader"
          :extensions="['yaml', 'yml']"
          @before-send="onUpload($event)"
          @error="uploadError($event)"
        >
          <u-button>
            <i-line-awesome
              name="download"
              :class="$style.download"
            />从文件导入
          </u-button>
        </u-uploader>

        <u-button
          icon="create"
          @click="showResourceModal = true"
        >
          从已有资源导入
        </u-button>
      </u-linear-layout>
    </div>
    <div style="margin-bottom: 20px">
      <u-notice icon="warning">
        为保证通过 YAML 文件创建的资源能够通过轻舟平台进行管理，平台将自动设置轻舟内置标签。
        <u-link
          @click="preview"
        >
          {{ isPreview ? '返回编辑' : '预览' }}
        </u-link>
      </u-notice>
    </div>
    <div
      ref="editor"
      :class="$style.editor"
    />

    <u-submit-button
      :click="submit.bind(this)"
      place="middle"
      :message="yamlErrorTip"
    >
      <template slot-scope="scope">
        <u-linear-layout>
          <u-button
            color="primary"
            :disabled="!!readOnly || scope.submitting"
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

    <u-modal
      :visible.sync="showResourceModal"
      title="已有资源导入"
      size="normal"
      ok-button=""
      cancel-button=""
    >
      <kube-form label-size="small">
        <kube-form-item label="资源类型">
          <u-select
            v-model="model.kind"
            :data="kinds"
            size="large"
          />
        </kube-form-item>
        <kube-form-item label="实例">
          <u-loading v-if="model.loading" />
          <template v-else>
            <u-select
              v-if="model.instance.length"
              key="list"
              v-model="model.target"
              size="large"
              :data="model.instance"
            />
            <u-select
              v-else
              key="none"
              size="large"
              :data="[{ text: '暂无实例' }]"
              disabled
            />
          </template>
        </kube-form-item>
        <u-submit-button
          v-if="!readOnly"
          :click="loadResource.bind(this)"
          place="middle"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="model.instance.length === 0 || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                确定
              </u-button>
              <u-button @click="showResourceModal = false">
                取消
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form>
      <!-- <div slot="foot"></div> -->
    </u-modal>
  </u-modal>
</template>

<script>
import { get } from 'vuex-pathify';
import { debounce, cloneDeep } from 'lodash';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata';
import yamljs from 'yamljs';
import {
    configs,
    getAPIKeyWork,
} from './utils';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
// import { makeVModelMixin } from 'kubecube/mixins/functional';
// monaco.editor.defineTheme('lightvs', {
//     base: 'vs',
//     inherit: true,
//     rules: [{ background: '#eeeeee19' }],
//     colors: {
//         'editor.background': '#eeeeee19',
//         'editor.lineHighlightBorder': '#ffffff00',
//     },
// });
// options in https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
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
    created() {
        this.loadMonaco();
    },
    destroyed() {
        this.uploadTimeoutId && clearTimeout(this.uploadTimeoutId);
        this.validateTimeoutId && clearTimeout(this.validateTimeoutId);
    },
    // mounted() {
    //     this.createMonaco();
    // },
    methods: {
        async loadMonaco() {
            if (!window.monaco) {
                const monaco = await import(/* webpackChunkName: "monaco-editor" */ 'monaco-editor/esm/vs/editor/editor.api');
                monaco.editor.defineTheme('lightvs', {
                    base: 'vs',
                    inherit: true,
                    rules: [{ background: '#eeeeee19' }],
                    colors: {
                        'editor.background': '#eeeeee19',
                        'editor.lineHighlightBorder': '#ffffff00',
                    },
                });
                window.monaco = monaco;
            }
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
            const keyword = getAPIKeyWork(configs[this.model.kind]);
            const p = cloneDeep(this.requestParam);
            Object.assign(p.pathParams, configs[this.model.kind], {
                name: this.model.target,
            });
            const response = await workloadService[`get${keyword}Instance`](p);
            const ctnt = yamljs.stringify(response, 20, 2);
            this.editor.getModel().setValue(ctnt);
            this.showResourceModal = false;
        },
        open() {
            this.show = true;
            const editorOp = Object.assign({}, defaultOption);
            this.readOnly = editorOp.readOnly;
            this.$nextTick(() => {
                this.editor = window.monaco.editor.create(
                    this.$refs.editor,
                    editorOp);

                this.editor.onDidChangeModelContent(debounce(() => {
                    const value = this.editor.getModel().getValue();
                    try {
                    // 重置
                        this.yamlErrorTip = '';

                        yamljs.parse(value);
                        this.yamlContent = value;
                    } catch (err) {
                        const { parsedLine, snippet } = err;
                        this.yamlErrorTip = `第${parsedLine}行解析错误："${snippet}"`;
                    }
                }, 250, { maxWait: 1000 }));
                // this.editor.getModel().setValue(ctnt);
            });
        },
        onUpload(event) {
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsText(event.file);
            this.uploadErrorTip = '';
            reader.onload = e => {
                this.editor.getModel().setValue(e.target.result);
            };
        },
        uploadError(e) {
            this.uploadErrorTip = e.name === 'ExtensionError' ? `只能上传 ${e.extensions.join(', ')} 类型的文件！` : e.message;
        },
        async preview() {
            try {


                if (!this.isPreview) {
                    let content = this.editor.getModel().getValue();
                    content = yamljs.parse(content);
                    const response = await workloadExtendService.deploy({
                        pathParams: {
                            cluster: this.cluster,
                        },
                        params: {
                            dryRun: true,
                        },
                        data: content,
                    });
                    const ctnt = yamljs.stringify(response, 20, 2);
                    this.editor.getModel().setValue(ctnt);
                    const editorOp = Object.assign({}, defaultOption, {
                        readOnly: true,
                    });
                    this.readOnly = true;
                    this.editor.updateOptions(editorOp);
                    this.isPreview = true;

                } else {
                    this.editor.getModel().setValue(this.yamlContent);
                    const editorOp = Object.assign({}, defaultOption);
                    this.readOnly = false;
                    this.editor.updateOptions(editorOp);
                    this.isPreview = false;

                }
            } catch (error) {
                this.yamlErrorTip = error.message;
            }

        },
        async submit() {
            this.yamlErrorTip = '';
            let content = this.editor.getModel().getValue();
            content = yamljs.parse(content);

            await workloadExtendService.deploy({
                pathParams: {
                    cluster: this.cluster,
                },
                data: content,
            });
            this.editor.dispose();
            this.close();
        },
    },
};
</script>

<style module>
.editor{
    height: 60vh;
    margin-bottom: 20px;
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
