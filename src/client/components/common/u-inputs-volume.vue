<template>
    <u-form-table ref="formTable" :dynamic="dynamic" @add="add" @change="onChange" @validate="valid = $event.valid">
        <thead>
            <tr>
                <th width="180px">挂载目录</th>
                <th width="110px">类型</th>
                <th width="250px">参数</th>
            </tr>
        </thead>
        <tbody>
            <tr is="u-form-table-tr" v-for="(item, index) in sortList" :key="index" :rules="rules" @remove="remove(index)" :can-be-empty="canBeEmpty" :is-empty="isEmpty.bind(this)">
                <td><u-input size="huge" name="mountPath" v-model="item.mountPath" @change="changeName($event, index)" :disabled="disabled" placeholder="字母、数字、中划线、下划线、英文句号或“/“组成，以“/“开头且以“/“结尾"></u-input></td>
                <td><u-select v-model="item.type" :data="types" size="huge normal" :disabled="disabled" @select="onSelectType($event, index)"></u-select></td>
                <td v-if="item.type === 'hostPath'">
                    <u-linear-layout gap="small">
                        <u-input size="huge" style="width: 120px" name="hostPath" v-model="item.name" :disabled="disabled" placeholder="path"></u-input>
                        <u-select size="huge" style="width: 109px;" v-model="item.pathType" :data="pathTypes" :disabled="disabled"></u-select>
                    </u-linear-layout>
                </td>
                <td v-show="item.type === 'emptyDir'">
                    <u-linear-layout gap="small">
                        <u-select size="huge" style="width: 110px;" key="emptyDir" v-model="item.name" :data="currentEmptyDirs"></u-select>
                        <u-select size="huge" style="width: 110px;" key="emptyDirRead" v-model="item.readOnly" :data="readOnlyList"></u-select>
                    </u-linear-layout>
                </td>
                <td v-show="item.type === 'pvc'">
                    <u-select v-if="pvcNames.length" key="listPVC" size="huge" v-model="item.name" :data="pvcNames"></u-select>
                    <u-select v-else disabled key="nonePVC" size="huge" :data="emptyPVCNames"></u-select>
                </td>
                <td v-show="item.type === 'secret'">
                    <u-select v-if="secretNames.length" key="listSecret" size="huge" v-model="item.name" :data="secretNames"></u-select>
                    <u-select v-else disabled key="noneSecret" size="huge" :data="emptySecretNames"></u-select>
                </td>
                <td v-show="item.type === 'configMap'">
                    <u-select v-if="configMapNames.length" key="listConfigMap" size="huge" v-model="item.name" :data="configMapNames"></u-select>
                    <u-select v-else disabled key="noneConfigMap" size="huge" :data="emptyConfigMapNames"></u-select>
                </td>
                <td v-show="item.type === 'volumeClaimTemplate'">
                    <u-select v-model="item.name" key="listTemplate" size="huge" :data="templates" :disabled="disabled"></u-select>
                </td>
            </tr>
        </tbody>
    </u-form-table>
</template>

<script>
import { Inputs } from '@micro-app/common/base/mixins';
const TYPES = [
    { text: 'PVC', value: 'pvc' },
    { text: 'HostPath', value: 'hostPath' },
    { text: 'EmptyDir', value: 'emptyDir' },
    { text: 'Secret', value: 'secret' },
    { text: 'ConfigMap', value: 'configMap' },
    { text: '存储模板', value: 'volumeClaimTemplate' },
];
const PATH_TYPES = ['DirectoryOrCreate', 'FileOrCreate'];

export default {
    name: 'u-inputs-volume',
    mixins: [Inputs],
    props: {
        disabled: { type: Boolean, default: false },
        secrets: { type: Array, default: () => ([]) },
        pvcNames: { type: Array, default: () => ([]) },
        configMaps: { type: Array, default: () => ([]) },
        emptyDirs: { type: Array, default: () => ([]) },
        templates: { type: Array, default: () => ([]) },
        type: { type: String },
        isCreate: { type: Boolean, default: false },
        showVolumeClaimTemplates: { type: Boolean, default: false },
        showEmptyDir: { type: Boolean, default: true },
    },
    computed: {
        secretNames() {
            return this.secrets.map((item) => ({ text: item.name, value: item.name }));
        },
        configMapNames() {
            return this.configMaps.map((item) => ({ text: item.name, value: item.name }));
        },
        // 取列表中的第一项，作为用户切换type时的默认值
        pvcName() {
            return ((this.pvcNames || [])[0] || {}).value;
        },
        secretName() {
            return ((this.secretNames || [])[0] || {}).value;
        },
        configMapName() {
            return ((this.configMapNames || [])[0] || {}).value;
        },
        volumeClaimTemplateName() {
            return ((this.templates || [])[0] || {}).value;
        },
        emptyDirName() {
            return ((this.currentEmptyDirs || [])[0] || {}).value;
        },
        types() {
            let res = this.showVolumeClaimTemplates ? TYPES.slice(1) : TYPES.slice(0, -1);

            if (!this.showEmptyDir)
                res = res.filter((item) => item.value !== 'emptyDir');

            return res;
        },

    },
    watch: {
        showVolumeClaimTemplates(value) {
            this.isCreate && this.sortList.forEach((item, index) => {
                const _item = value ? Object.assign(item, {
                    type: 'hostPath', name: '', pathType: 'DirectoryOrCreate',
                }) : Object.assign(item, {
                    type: 'pvc', name: this.pvcName,
                });
                this.sortList.splice(index, 1, _item);
            });
        },
        emptyDirs(value) {
            if (value && value.length) {
                this.currentEmptyDirs = this.getEmptyDirList(value);
                this.sortList.forEach((item) => {
                    // 修改后的emptyDirs如果不包含了现有挂载数据卷中，类型为emptyDir的项。则将其重置
                    if (item.type === 'emptyDir' && !value.some((emptyDir) => emptyDir.name === item.name))
                        item.name = '';
                });
            }
        },
        list: {
            handler(val) {
                this.sortList = this.normalize(val);
            },
            deep: true,
        }
    },
    data() {
        return {
            dynamic: !this.disabled,
            emptySecretNames: [{ text: '暂无 Secret' }],
            emptyConfigMapNames: [{ text: '暂无 ConfigMap' }],
            emptyPVCNames: [{ text: '暂无 PVC' }],
            pathTypes: PATH_TYPES.map((item) => ({ text: item, value: item })),
            currentEmptyDirs: this.getEmptyDirList(this.emptyDirs),
            readOnlyList: [
                { text: '读写', value: false },
                { text: '只读', value: true },
            ],
            rules: {
                mountPath: [
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: '以“/”开头' },
                    { type: 'string', pattern: /^\/[\w\-\.\/]*$/, trigger: 'input+blur', message: '字母、数字、中划线、下划线、英文句号或“/”组成' },
                    { type: 'string', message: '不得包含连续的"/"', trigger: 'input+blur', validator: (rule, value, callback) => (value.indexOf('//') === -1) ? callback() : callback(new Error()) },
                    { type: 'string', trigger: 'input+blur', message: '该挂载目录已存在', validator: (rule, value, callback) => {
                        const mountPathList = this.sortList.map((item) => this.getMountPath(item.mountPath));
                        (mountPathList.filter((item) => item === this.getMountPath(value)).length > 1) ? callback(new Error()) : callback();
                    } },
                ],
                hostPath: [
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: '以“/”开头' },
                    { type: 'string', pattern: /^\/[\w\-\.\/]*$/, trigger: 'input+blur', message: '字母、数字、中划线、下划线、英文句号或“/”组成' },
                    { type: 'string', message: '不得包含连续的"/"', trigger: 'input+blur', validator: (rule, value, callback) => (value.indexOf('//') === -1) ? callback() : callback(new Error()) },
                ],
            },
        };
    },
    methods: {
        getDefault() {
            return {
                mountPath: '',
                name: this.showVolumeClaimTemplates ? '' : this.pvcName,
                type: this.showVolumeClaimTemplates ? 'hostPath' : 'pvc',
                pathType: this.showVolumeClaimTemplates ? 'DirectoryOrCreate' : '',
                readOnly: false, // 默认读写
            };
        },
        normalize(list) {
            return list.map((item) => {
                const { mountPath, type, name, hostPath } = item;
                if (type === 'hostPath') {
                    return {
                        type,
                        mountPath,
                        name: hostPath.path, // hostpath的name是path
                        pathType: hostPath.type,
                        volumeName: item.volumeName,
                    };
                } else if (type === 'emptyDir') {
                    return {
                        name,
                        type,
                        mountPath,
                        readOnly: _.get(item, 'emptyDir.readOnly', false),
                    };
                } else
                    return item;
            });
        },
        $getData(list) {
            return this.getLegalList(list || this.sortList)
                .filter((item) => item.mountPath && (item.type === 'hostPath' ? item.name : true) && (item.type === 'emptyDir' ? item.name : true))
                .map((item) => {
                    const { mountPath, type, name, pathType, readOnly } = item;
                    if (type === 'hostPath') {
                        return {
                            type,
                            mountPath,
                            hostPath: {
                                path: name,
                                type: pathType,
                            },
                        };
                    } else if (type === 'emptyDir') {
                        const emptyDir = this.emptyDirs.find((item) => item.value === name);
                        return {
                            type,
                            mountPath,
                            name: emptyDir.value,
                            emptyDir: Object.assign({}, _.pick(emptyDir, ['medium', 'sizeLimit']), { readOnly }),
                        };
                    } else
                        return { mountPath, type, name };
                });
        },
        // 给name赋值为对应type下的值
        onSelectType(event, index) {
            const type = event.value || 'hostPath';
            this.sortList[index].name = type === 'hostPath' ? '' : this[type + 'Name'];
            this.sortList[index].pathType = type === 'hostPath' ? 'DirectoryOrCreate' : '';
        },
        getMountPath(path = '') {
            return path.endsWith('/') ? path.slice(0, -1) : path;
        },
        getEmptyDirList(list = []) {
            return [{ text: '请选择', value: '' }].concat(list);
        },
        changeName(event, index) {
            this.sortList[index].name = this.sortList[index].type === 'hostPath' ? '' : this.sortList[index].name || this[this.sortList[index].type + 'Name'];
            this.sortList[index].pathType = this.sortList[index].type === 'hostPath' ? 'DirectoryOrCreate' : '';
        },
    },
};
</script>
