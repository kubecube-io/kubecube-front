<template>
  <div />
</template>

<script>
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { makeVModelMixin } from 'kubecube/mixins/functional';
// monaco.editor.defineTheme('lightvs', {
//     base: 'vs',
//     inherit: true,
//     rules: [{ background: '#eeeeee19' }],
//     colors: {
//         'editor.background': '#eeeeee19',
//         'editor.lineHighlightBorder': '#ffffff00',
//     },
// });
export default {
    mixins: [ makeVModelMixin ],
    props: {
        language: {
            type: String,
            default: 'yaml',
        },
        option: {
            type: Object,
            default: Object,
        },
    },
    watch: {
        dark() {
            this.editor.updateOptions({
                theme: this.theme,
            });
        },
    },
    created() {
        this.loadMonaco();
    },
    mounted() {
        this.createMonaco();

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
        createMonaco() {
            const editor = this.editor = window.monaco.editor.create(this.$el, {
                language: this.language,
                theme: 'lightvs',
                automaticLayout: true,
                ...this.option,
            });
            editor.getModel().setValue(this.model);
            editor.onDidChangeModelContent(() => {
                const value = editor.getModel().getValue();
                this.model = value;
            });
            const editorModel = editor.getModel();
            this.$watch('value', val => {
                // console.log(val, editorModel.getValue());
                if (val !== editorModel.getValue()) {
                    editor.getModel().setValue(val);
                }
            });
        },
    },
};
</script>

<style module>

</style>
