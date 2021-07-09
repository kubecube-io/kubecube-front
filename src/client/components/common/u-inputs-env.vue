<template>
    <u-form-table ref="formTable" :dynamic="true" @add="add" @change="onChange" @validate="valid = $event.valid">
        <thead>
            <tr>
                <th width="169px">Key</th>
                <th width="110px">Value 类型</th>
                <th width="261px">Value</th>
            </tr>
        </thead>
        <tbody>
            <!-- 暂时只支持type为‘值’的 -->
            <tr is="u-form-table-tr" v-for="item in sortExtraList" :key="item.name" disabled ignore>
                <td><u-input disabled size="huge" :value="item.name"></u-input></td>
                <td><u-select disabled size="huge" :value="item.type" :data="types"></u-select></td>
                <!-- 系统添加的 env 键值对，目前仅支持：string、field、resource -->
                <td v-show="item.type === 'string'"><u-input disabled size="huge" :value="item.value" placeholder="0-2048个 ASCII 字符组成"></u-input></td>
                <td v-show="item.type === 'field'"><u-select-with-empty disabled :data="fields" v-model="item.fieldPath" size="huge full"></u-select-with-empty></td>
                <td v-show="item.type === 'resource'">
                    <u-linear-layout gap="small">
                        <u-select-with-empty disabled :data="containerNames" v-model="item.containerName" size="huge small"></u-select-with-empty>
                        <u-select-with-empty disabled :data="resources" v-model="item.resource" size="huge small"></u-select-with-empty>
                    </u-linear-layout>
                </td>
            </tr>

            <tr is="u-form-table-tr" v-for="(item, index) in sortList" :key="index" :rules="rules" @remove="remove(index)" :can-be-empty="canBeEmpty" :is-empty="isEmpty.bind(this)">
                <td><u-input size="huge" ref="input" name="name" v-model="item.name" placeholder="1-64位字母、数字或下划线组成，以字母开头" title="1-64位字母、数字或下划线组成，以字母开头"></u-input></td>
                <td><u-select size="huge" v-model="item.type" :data="types"></u-select></td>
                <td v-show="item.type === 'string'"><u-input size="huge full" name="value" v-model="item.value" placeholder="0-2048个 ASCII 字符组成" title="0-2048个 ASCII 字符组成"></u-input></td>
                <td v-show="item.type === 'secret'">
                    <u-linear-layout gap="small">
                        <u-select v-if="secretNames.length" key="listName" size="huge small" v-model="item.secretName" :data="secretNames" @select="onSelectSecretName($event, index)"></u-select>
                        <u-select v-else key="noneName" size="huge small" :data="[{ text: '暂无 secret' }]" disabled></u-select>
                        <u-select v-if="item.secretKeys.length" key="listKey" size="huge small" v-model="item.secretKey" :data="item.secretKeys"></u-select>
                        <u-select v-else size="huge small" key="noneKey" :data="[{ text: '暂无 secret key'}]" disabled></u-select>
                    </u-linear-layout>
                </td>
                <td v-show="item.type === 'configMap'">
                    <u-linear-layout gap="small">
                        <u-select v-if="configMapNames.length" key="listConfigMapName" size="huge small" v-model="item.configMapName" :data="configMapNames" @select="onSelectConfigMapName($event, index)"></u-select>
                        <u-select v-else key="noneConfigMapName" size="huge small" :data="[{ text: '暂无 configMap'}]" disabled></u-select>
                        <u-select v-if="item.configMapKeys.length" key="listConfigMapKey" size="huge small" v-model="item.configMapKey" :data="item.configMapKeys"></u-select>
                        <u-select v-else size="huge small" key="noneConfigMapKey" :data="[{ text: '暂无 configMap key'}]" disabled></u-select>
                    </u-linear-layout>
                </td>
                <td v-show="item.type === 'field'">
                    <u-select-with-empty :data="fields" v-model="item.fieldPath" size="huge full"></u-select-with-empty>
                </td>
                <td v-show="item.type === 'resource'">
                    <u-linear-layout gap="small">
                        <u-select-with-empty :data="containerNames" v-model="item.containerName" :needDefault="true" size="huge small"></u-select-with-empty>
                        <u-select-with-empty :data="resources" v-model="item.resource" size="huge small"></u-select-with-empty>
                    </u-linear-layout>
                </td>
            </tr>
        </tbody>
    </u-form-table>
</template>

<script>
import { Inputs } from '@micro-app/common/base/mixins';
import { at, get } from 'lodash';
const FIELD_DATA = [
    'metadata.name',
    'metadata.namespace',
    'metadata.uid',
    'spec.nodeName',
    'spec.serviceAccountName',
    'status.hostIP',
    'status.podIP',
];

const RESOURCE_DATA = [
    'requests.ephemeral-storage',
    'requests.memory',
    'requests.cpu',
    'limits.ephemeral-storage',
    'limits.memory',
    'limits.cpu',
];
// enhance: valueFrom 属性
export default {
    name: 'u-inputs-env',
    mixins: [Inputs],
    props: {
        type: { type: String },
        secrets: { type: Array, default: () => ([]) },
        configMaps: { type: Array, default: () => ([]) },
        containerNames: { type: Array, default: () => ([]) },
        extraList: { type: Array, default: () => ([]) },
    },
    data() {
        return {
            sortExtraList: [],
            fields: FIELD_DATA,
            resources: RESOURCE_DATA,
            rules: {
                name: [
                    { type: 'string', pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/, trigger: 'input+blur', message: 'Key 由1-64位字母、数字、或下划线组成，以字母开头' },
                    { type: 'string', trigger: 'input+blur', message: '不能使用系统保留环境变量', validator: (rule, value, callback) => {
                        return value.startsWith('SKIFF_') ? callback(new Error()) : callback();
                    } },
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => this.sortList.some((item) => {
                        const isError = item.type === 'string' ? !!(item.name === value && !value && item.value) : !!(item.name === value && !value && item.secretKey && item.secretName);
                        return !!isError;
                    }) ? callback(new Error()) : callback() },
                    { type: 'string', trigger: 'blur', message: 'Key 不能为空', validator: (rule, value, callback) => this.sortList.some((item) => {
                        const isError = item.type === 'string' ? (item.name === value && !value && item.value) : (item.name === value && !value && item.secretKey && item.secretName);
                        return !!isError;
                    }) ? callback(new Error()) : callback() },
                ],
                value: [
                    // eslint-disable-next-line
                    { type: 'string', pattern: /^[\u0000-\u007F]{0,2048}$/, trigger: 'input+blur', message: 'value 由0-2048个 ASCII 字符组成' },
                ],
            },
        };
    },
    computed: {
        secretNames() {
            return this.secrets.map((item) => ({ text: item.name, value: item.name }));
        },
        configMapNames() {
            return this.configMaps.map((item) => ({ text: item.name, value: item.name }));
        },
        defaultSecretKeys() {
            return this.getKeys('', 'secrets');
        },
        defaultConfigMapKeys() {
            return this.getKeys('', 'configMaps');
        },
        types() {
            if (!this.type) {
                return [
                    { value: 'string', text: '值' },
                    { value: 'secret', text: 'Secret' },
                    { value: 'configMap', text: 'ConfigMap' },
                    { value: 'field', text: 'Field' },
                    { value: 'resource', text: 'Resource' },
                ];
            } else if (this.type === 'cicd') {
                return [{ value: 'string', text: '值' }];
            }
        },
    },
    watch: {
        containerNames(value) {
            // 因为container name 时刻可以变更.如果变更后的container name 列表没有当前项，则重置其值
            this.sortList.forEach((item) => {
                if (value && item.containerName && !value.includes(item.containerName))
                    item.containerName = '';
            });
        },
        secrets: {
            handler(value) {
                if (value.length)
                    this.sortList.forEach((item, index) => {
                        item.secretKeys =  item.secretName ? this.getKeys(item.secretName, 'secrets') : this.defaultSecretKeys;
                        item.secretKey = item.secretKey || ((item.secretKeys && item.secretKeys[0]) || {}).value;
                        item.secretName = item.secretName || ((this.secretNames && this.secretNames[0]) || {}).value,
                        this.sortList.splice(index, 1, item);
                    });
            },
            deep: true,
        },
        configMaps: {
            handler(value) {
                if (value.length)
                    this.sortList.forEach((item, index) => {
                        item.configMapKeys = item.configMapName ? this.getKeys(item.configMapName, 'configMaps') : this.defaultConfigMapKeys;
                        item.configMapKey = item.configMapKey || ((item.configMapKeys && item.configMapKeys[0]) || {}).value;
                        item.configMapName = item.configMapName || ((this.configMapNames && this.configMapNames[0]) || {}).value;
                        this.sortList.splice(index, 1, item);
                    });
            },
            deep: true,
        },
    },
    created() {
        // 不能在data()函数内调用 this.normalize，因为此时types还没有初始化。如果 extraList 内有 valueFrom 的对应数据，就会报错
        this.sortExtraList = this.normalize(this.extraList);
    },
    methods: {
        getDefault() {
            return {
                name: '',
                value: '',
                type: 'string',
                secretName: ((this.secretNames && this.secretNames[0]) || {}).value,
                secretKeys: this.defaultSecretKeys,
                secretKey: ((this.defaultSecretKeys && this.defaultSecretKeys[0]) || {}).value,
                configMapName: ((this.configMapNames && this.configMapNames[0]) || {}).value,
                configMapKeys: this.defaultConfigMapKeys,
                configMapKey: ((this.defaultConfigMapKeys && this.defaultConfigMapKeys[0]) || {}).value,
                fieldPath: FIELD_DATA[0],
                containerName: '',
                resource: RESOURCE_DATA[0],
            };
        },
        getKeys(name, key = 'secrets') {
            const arr = this[key] || [];
            if (!arr.length)
                return [];

            const index = arr.findIndex((item) => item.name === name);
            const keys = Object.keys(arr[index < 0 ? 0 : index].data);
            return keys.map((item) => ({ text: item, value: item }));
        },
        normalize(list) {
            const getType = (item = {}) => {
                let tmp = '';
                const { valueFrom } = item;

                if (!valueFrom)
                    return 'string';

                Object.keys(item.valueFrom).some((key) => {
                    const type = this.types.find((item) => key.startsWith(item.value));
                    if (type) {
                        tmp = type.value;
                        return true;
                    } else
                        return false;
                });
                return tmp;
            };

            return list.map((item) => {
                const [secretKey, secretName] = at(item, ['valueFrom.secretKeyRef.key', 'valueFrom.secretKeyRef.name']);
                const [configMapKey, configMapName] = at(item, ['valueFrom.configMapKeyRef.key', 'valueFrom.configMapKeyRef.name']);
                const fieldPath = get(item, 'valueFrom.fieldRef.fieldPath', '');
                const resourceFieldRef = get(item, 'valueFrom.resourceFieldRef');
                const secretKeys = secretName ? this.getKeys(secretName, 'secrets') : this.defaultSecretKeys;
                const configMapKeys = configMapName ? this.getKeys(configMapName, 'configMaps') : this.defaultConfigMapKeys;
                return {
                    name: item.name,
                    value: item.value || '',
                    type: getType(item),
                    secretName: secretName || ((this.secretNames && this.secretNames[0]) || {}).value,
                    secretKeys,
                    secretKey: secretKey || ((secretKeys && secretKeys[0]) || {}).value,
                    configMapName: configMapName || ((this.configMapNames && this.configMapNames[0]) || {}).value,
                    configMapKeys,
                    configMapKey: configMapKey || ((configMapKeys && configMapKeys[0]) || {}).value,
                    fieldPath,
                    containerName: resourceFieldRef && this.containerNames.includes(resourceFieldRef.containerName) ? resourceFieldRef.containerName : '',
                    resource: resourceFieldRef ? resourceFieldRef.resource : '',
                };
            });
        },
        onSelectSecretName(event, index) {
            const keys = this.getKeys(event.value, 'secrets');
            Object.assign(this.sortList[index], {
                secretKeys: keys,
                secretKey: keys.length ? keys[0].value : undefined,
            });
            this.$refs.input && this.$refs.input[0].blur();
        },
        onSelectConfigMapName(event, index) {
            const keys = this.getKeys(event.value, 'configMaps');
            Object.assign(this.sortList[index], {
                configMapKeys: keys,
                configMapKey: keys.length ? keys[0].value : undefined,
            });
            this.$refs.input && this.$refs.input[0].blur();
        },
        getFormData(item = {}) {
            const { type, fieldPath, containerName, resource } = item;
            if (['secret', 'configMap'].includes(type)) {
                return {
                    [`${type}KeyRef`]: {
                        name: item[`${type}Name`],
                        key: item[`${type}Key`],
                    },
                };
            } else if (type === 'field') {
                return {
                    fieldRef: { fieldPath },
                };
            } else if (type === 'resource') {
                return {
                    resourceFieldRef: { containerName, resource },
                };
            } else
                return {};
        },
        $getData(list) {
            const tmp = this.getLegalList(list || this.sortList).concat(this.sortExtraList);
            // 类型为 resource 时，必须要选择对应的 containerName
            return tmp.filter((item) => item.name && (item.type === 'resource' ? item.containerName : true))
                .map((item) => {
                    return item.type === 'string' ?
                        { name: item.name, value: item.value } :
                        { name: item.name, valueFrom: this.getFormData(item) };
                });
        },
    },
};
</script>
