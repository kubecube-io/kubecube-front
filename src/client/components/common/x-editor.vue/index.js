import ace from 'brace';
import { Field } from 'cloud-ui.vusion';
// import 'brace/mode/json';

export default {
    name: 'x-editor',
    mixins: [Field],
    props: {
        width: String,
        height: String,
        value: { type: String, default: '' },
        lang: { type: String, default: 'text' },
        theme: { type: String, default: 'textmate' },
        disabled: { type: Boolean, default: false },
        formatter: { type: Function },
        options: Object, // ace支持的所有定制参数，见：https://github.com/ajaxorg/ace/wiki/Configuring-Ace
    },
    data() {
        return {
            editor: null,
            content: '',
        };
    },
    watch: {
        value(val) {
            if (this.content !== val)
                this.editor.setValue(val, 1);
        },
        theme(value) {
            this.getRequires();
            this.setTheme();
        },
        lang(newLang) {
            this.editor.getSession().setMode(`ace/mode/${newLang}`);
        },
        disabled(value) {
            this.setDisable(value);
        },
        options: {
            handler(value) {
                this.setOptions(value);
            },
            deep: true,
        },

    },
    mounted() {
        this.editor = ace.edit(this.$el);

        this.$emit('init', this.editor);
        this.getRequires().then(() => {
            this.editor.$blockScrolling = Infinity;
            this.editor.getSession().setMode(`ace/mode/${this.lang}`);
            this.editor.setValue(typeof this.formatter === 'function' ? this.formatter(this.value) : this.value, 1);

            this.setTheme();
            this.setOptions(this.options);

            this.editor.on('change', () => {
                const content = this.editor.getValue();
                this.$emit('input', content);
                this.$emit('validate', {
                    valid: this.validateJson(content),
                });
                this.content = content;
            });

            this.editor.on('blur', () => this.$emit('blur'));
            this.editor.on('focus', () => this.$emit('focus'));

            this.disabled && this.setDisable();
        });
    },
    methods: {
        // 切换 x-editor 的disabled状态
        setDisable(isDisable = true) {
            this.editor.setOptions({
                readOnly: isDisable,
                highlightActiveLine: !isDisable,
                highlightGutterLine: !isDisable,
                showPrintMargin: !isDisable,
            });
            this.editor.renderer.$cursorLayer.element.style.opacity = !isDisable;
        },
        setOption(key, value) {
            this.editor.setOption(key, value);
        },
        setOptions(options = {}) {
            Object.keys(options).length && this.editor.setOptions(options);
        },
        setTheme() {
            this.editor.setTheme(`ace/theme/${this.theme}`);
        },
        getRequires() {
            const importList = [];
            if (this.lang !== 'text')
                importList.push(import(/* webpackChunkName: "braceConfigLang" */`./lang`).then((result) => { result.default instanceof Function && result.default(this.lang); }).catch((error) => { console.error(error); }));
            if (this.theme !== 'textmate')
                importList.push(import(/* webpackChunkName: "braceConfigTheme" */`./theme`).then((result) => { result.default instanceof Function && result.default(this.theme); }).catch((error) => { console.error(error); }));
            return Promise.all(importList);
        },
        validateJson(json) {
            if (!json)
                return true;

            try {
                JSON.parse(json);
            } catch (error) {
                if (error)
                    return false;
            }
            return true;
        },
    },
};
