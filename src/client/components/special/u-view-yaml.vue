<template>
    <u-modal class="form-error-block" @close="close" :title="title" ok-button="" cancel-button="" :visible.sync="show" size="huge">
        <u-easy-copy :text="sortModel"></u-easy-copy>
        <x-ace-editor v-model="sortModel" ref="editor" disabled lang="yaml" theme="textmate" :options="editorOptions"></x-ace-editor>
    </u-modal>
</template>

<script>
import XAceEditor from 'cloud-ui.vusion/packages/x-ace-editor.vue';
import { Modal } from '@micro-app/common/base/mixins';
import yamljs from 'yamljs';


export default {
    name: 'u-view-yaml',
    components: {
        'x-ace-editor': XAceEditor,
    },
    mixins: [Modal],
    props: {
        model: { type: Object, default: () => ({}) },
    },
    computed: {
        sortModel() {
            return yamljs.stringify(this.model, 20, 2);
        },
    },
    data() {
        return {
            title: '查看详情',
            isObject: !(this.list instanceof Array),
            editorOptions: {
                tabSize: 2,
                scrollPastEnd: 0.2,
            },
        };
    },
};
</script>
