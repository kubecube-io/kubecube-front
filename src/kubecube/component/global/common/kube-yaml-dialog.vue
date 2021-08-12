<template>
  <u-modal
    :title="title"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <div>
      <div
        ref="editor"
        :class="$style.editor"
      />

      <u-submit-button
        v-if="!readOnly"
        :click="submit.bind(this)"
        place="middle"
        :message="yamlErrorTip"
      >
        <template slot-scope="scope">
          <u-linear-layout>
            <u-button
              color="primary"
              :disabled="!!yamlErrorTip || scope.submitting"
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
    </div>
  </u-modal>
</template>

<script>
import { debounce } from 'lodash';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Modal } from '@micro-app/common/mixins';
import yamljs from 'yamljs';
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
            readOnly: false,
        };
    },
    // mounted() {
    //     this.createMonaco();
    // },
    created() {
        this.loadMonaco();
    },
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
        open(option) {
            const {
                title,
                content,
                editorOption = {},
                onSubmit,
            } = option;
            this.title = title;
            this.onSubmit = onSubmit || (() => null);
            this.show = true;
            const ctnt = typeof content === 'string' ? content : yamljs.stringify(content, 20, 2);
            const editorOp = Object.assign({}, defaultOption, editorOption);
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
                    } catch (err) {
                        const { parsedLine, snippet } = err;
                        this.yamlErrorTip = `第${parsedLine}行解析错误："${snippet}"`;
                    }
                }, 250, { maxWait: 1000 }));
                this.editor.getModel().setValue(ctnt);
            });
        },
        // createMonaco() {
        //     console.log(this.$refs)
        //     this.editor = monaco.editor.create(this.$refs.editor, defaultOption);
        // },
        async submit() {
            this.yamlErrorTip = '';
            let content = this.editor.getModel().getValue();
            // try {
            content = yamljs.parse(content);
            // } catch (err) {
            //     const { parsedLine, snippet } = err;
            //     throw new Error(`第${parsedLine}行解析错误："${snippet}"`);
            // }

            await this.onSubmit(content);
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
</style>
