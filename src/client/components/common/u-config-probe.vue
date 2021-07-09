<template>
    <!-- <u-form gap="large" :class="$style.root"> -->
    <u-form :rules="rules" gap="large" @validate="pathValid = $event.valid">
        <u-form-item v-if="!isLifecycle" label="故障阈值">
            <u-number-input size="huge normal" v-model="model.failureThreshold" :default-value="3" :min="1"></u-number-input> 次
        </u-form-item>
        <u-form-item v-if="!isLifecycle" label="健康阈值">
            <u-number-input size="huge normal" v-model="model.successThreshold" :min="1" :disabled="type === 'liveness'"></u-number-input> 次
        </u-form-item>
        <u-form-item v-if="!isLifecycle" label="初始等待时间">
            <u-number-input size="huge normal" v-model="model.initialDelaySeconds" :min="0"></u-number-input> 秒
        </u-form-item>
        <u-form-item v-if="!isLifecycle" label="监测间隔时间">
            <u-number-input size="huge normal" v-model="model.periodSeconds" :default-value="10" :min="1"></u-number-input> 秒
        </u-form-item>
        <u-form-item v-if="!isLifecycle" label="检测超时时间">
            <u-number-input size="huge normal" v-model="model.timeoutSeconds" :default-value="1" :min="1"></u-number-input> 秒
        </u-form-item>
        <u-form-item label="检测方式">
            <u-capsules v-model="model.type" :data="types"></u-capsules>
        </u-form-item>
        <u-form-item label="执行脚本" layout="block" v-show="model.type === 'exec'" required>
            <u-textarea-config ref="command" :class="$style.textarea" placeholder="1024字符以内，区分大小写字母" err-message="不能超过1024个字符" :values="model.command" @change="onCommandChange"></u-textarea-config>
        </u-form-item>
        <u-form-item label="Host" v-show="model.type !== 'exec'">
            <u-input :class="$style.input" v-model="model.host"></u-input>
        </u-form-item>
        <u-form-item label="Path" v-show="model.type === 'httpGet'" name="path" required>
            <u-input :class="$style.input" v-model="model.path" @input="onPathInput"></u-input>
        </u-form-item>
        <u-form-item label="Port" v-show="model.type !== 'exec'">
            <u-number-input size="huge normal" v-model="model.port" :min="0" :max="65535"></u-number-input>
        </u-form-item>
        <!-- 这里用v-show是为了切换方式时，不重新创建删除u-inputs-header组件 -->
        <u-form-item label="Header" v-show="model.type === 'httpGet'" layout="block">
            <u-inputs-header ref="header" :list="model.httpHeaders" size="small" @change="(model.httpHeaders = $event.value) && validate()" @validate="headerValid = $event.valid"></u-inputs-header>
        </u-form-item>
    </u-form>
</template>
<style module>
.root {
    margin-top: -9px;
}
.input {
    width: 460px;
}
.textarea {
    width: 460px;
}
</style>
<script>

import { mapComponents } from '@micro-app/common/utils';
import InputsHeader from './u-inputs-header.vue';
// enhance: 数据丢失
// livenessProbe - 容器运行探针， readinessProbe - 业务运行探针， lifecycle - 生命周期
export default {
    name: 'u-config-probe',
    components: mapComponents([InputsHeader]),
    props: {
        show: { type: Boolean, default: false }, // 主要是为了让当前组件展开后执行validate
        type: { type: String, default: 'liveness' },
        info: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            valid: false,
            headerValid: true,
            pathValid: false,
            types: [
                { value: 'exec', text: '脚本' },
                { value: 'httpGet', text: 'HTTP' },
                { value: 'tcpSocket', text: 'TCP' },
            ],
            model: {
                failureThreshold: 3, // 故障阀值
                successThreshold: 1, // 健康阀值,对于livenessProbe，必须为1
                initialDelaySeconds: 0, // 初始等待时间
                periodSeconds: 10, // 监测间隔时间
                timeoutSeconds: 1, // 监测超时时间
                type: 'exec',
                command: '',
                isCommandError: false,
                host: '',
                path: '',
                port: 8080,
                httpHeaders: [],
            },
            rules: {
                path: [
                    { type: 'string', required: true, trigger: 'input+blur', message: '' },
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: '以"／"开头' },
                ],
            },
        };
    },
    computed: {
        isLifecycle() {
            return this.type === 'lifecycle';
        },
    },
    watch: {
        'model.type'() {
            this.validate();
        },
        show(value) {
            this.validate();
        },
    },
    created() {
        Object.keys(this.info).length && this.normalize();
        // this.$watch([this.model.host, this.model.path], () => this.validate());
    },
    methods: {
        normalize() {
            const { failureThreshold, successThreshold, initialDelaySeconds, periodSeconds, timeoutSeconds } = this.info;
            Object.assign(this.model, { failureThreshold, successThreshold, initialDelaySeconds, periodSeconds, timeoutSeconds });
            ['exec', 'httpGet', 'tcpSocket'].forEach((item) => {
                if (this.info[item]) {
                    this.model.type = item;
                    Object.assign(this.model, this.info[item]);
                }
            });
        },
        onCommandChange(event) {
            this.model.command = event.value;
            this.model.isCommandError = event.isError;
            this.validate();
        },
        onPathInput() {
            // 这里pathValid的更新较慢，u-input的input事件回调更快些
            setTimeout(() => this.validate());
        },
        validate() {
            const { type, command, path, isCommandError } = this.model;
            let valid = true;
            type === 'exec' && (valid = !!command && !isCommandError);
            type === 'httpGet' && (valid = !!path && this.pathValid && this.headerValid);
            this.valid = valid;
            // 组件收起时，valid结果必然为true
            this.$emit('validate', { valid: this.show ? valid : true });
            this.$emit('change', this.model);
        },
        $getData() {
            if (!this.valid)
                return;
            const {
                failureThreshold, successThreshold,
                initialDelaySeconds, periodSeconds, timeoutSeconds,
                type, command, host, path, port,
            } = this.model;

            // lifecycle 类型只需要部分参数，change 事件并没有区分。
            const tmp = { [type]: {} };
            !this.isLifecycle && Object.assign(tmp, { failureThreshold, successThreshold, initialDelaySeconds, periodSeconds, timeoutSeconds });
            
            type === 'exec' && (tmp.exec.command = this.$refs.command.$getData(command));
            type === 'httpGet' && Object.assign(tmp.httpGet, { host, path, port, httpHeaders: this.$refs.header.$getData() });
            type === 'tcpSocket' && Object.assign(tmp.tcpSocket, { host, port });
            return tmp;
        },
    },
};
</script>
