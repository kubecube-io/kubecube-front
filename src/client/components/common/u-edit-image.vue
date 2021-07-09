<template>
    <div>
        <u-validate-input :style="'width:' + width" ref="input" size="huge" name="image" :rules="imageRules" v-model="image" @input="onChange" @validate="onValidate"></u-validate-input>
        <u-link style="padding-left: 10px;" @click="showModal = true">选择镜像</u-link>

        <u-select-image :show-modal.sync="showModal" :cluster-id="clusterId" :project-name="projectName" :tenant-name="tenantName" title="选择镜像" :image.sync="image" @change="onSelectImage"></u-select-image>
    </div>
</template>

<script>
import { Subscribe } from '@micro-app/common/base/mixins';

export default {
    name: 'u-edit-image',
    mixins: [Subscribe],
    props: {
        image: String,
        width: { type: String, default: '300px' },
        clusterId: [String, Number],
    },
    data() {
        return {
            projectName: '',
            tenantName: '',
            showModal: false,
            // 完整路径（<path>:<tag>）由大小写字母、数字、中划线、下划线、英文句号组成，多个路径间以“/”分隔
            imageRules: [
                { type: 'string', required: true, trigger: 'input+blur', message: '' },
                { type: 'string', pattern: /^[a-z0-9]/, trigger: 'input+blur', message: '以小写字母或者数字开头' },
                { type: 'string', pattern: /^[a-zA-Z0-9-_.:/]*$/, trigger: 'input+blur', message: '' },
            ],
        };
    },
    subscribes: {
        loadCurInfos(data) {
            this.projectName = data.project.enName;
            this.tenantName = data.tenant.enName;
        },
    },
    methods: {
        onChange(event) {
            // 这个事件是为了更新双向绑定（fake）的image数据
            this.$emit('update:image', event);
            // 这里是为了触发其他的操作抛出的事件
            this.$emit('change');
        },
        onValidate(event) {
            this.$emit('validate', event);
        },
        onSelectImage(event) {
            // console.log(result);
            this.onChange(event);
            this.$nextTick(() => {
                this.$refs.input && this.$refs.input.validate();
            });
        },
    },
};
</script>

