<template>
    <div :class="$style.root">
        <u-form-table ref="formTable" :dynamic="isCreate" @add="add" @change="onChange" @validate="valid = $event.valid">
            <tbody>
                <tr is="u-form-table-tr" v-for="(item, index) in sortList" :key="index" :rules="rules" @remove="remove(index)" :can-be-empty="canBeEmpty" :is-empty="isEmpty.bind(this)">
                    <td :width="isCreate ? '540px' : '580px'"><u-input size="huge full" name="dir" v-model="item.dir" placeholder='字母、数字、中划线、下划线、英文句号或“/“组成，以“/“开头且以“/“结尾'></u-input></td>
                </tr>
            </tbody>
        </u-form-table>
    </div>
</template>

<style module>
.root {
    margin-top: -25px;
}

</style>


<script>
import { Inputs } from '@micro-app/common/base/mixins';

export default {
    name: 'u-inputs-dir',
    mixins: [ Inputs ],
    props: {
        isCreate: { type: Boolean, default: true },
        dirs: {type: Array, default: () => ([]) }, // 所有的容器内需要保证dir唯一 [{ dir: 'xxx' }]
    },
    data() {
        return {
            rules: {
                dir: [
                    { type: 'string', required: true, trigger: 'input+blur', ignore: true, message: ''},
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: '以“/”开头' },
                    { type: 'string', pattern: /^\/[\w\-\.\/]*$/, trigger: 'input+blur', message: '字母、数字、中划线、下划线、英文句号或“/”组成' },
                    { type: 'string', message: '不得包含连续的"/"', trigger: 'input+blur', validator: (rule, value, callback) => (value.indexOf('//') === -1) ? callback() : callback(new Error())},
                    { type: 'string', pattern: /\/$/, trigger: 'input', message: '' },
                    { type: 'string', pattern: /\/$/, trigger: 'blur', message: '以“/”结尾' },
                    { type: 'string', trigger: 'input+blur', message: '该日志目录已存在', validator: (rule, value, callback) => (this.dirs.filter((item) => item.dir === value).length > 1) ? callback(new Error()) : callback() },
                ],
            },
            currentDirs: this.dirs,
        };
    },
    created() {
        // 设置页面日志目录不能增减，变为必填
        this.rules.dir[0].ignore = this.isCreate;
    },
    watch: {
        dirs(value) {
            this.currentDirs = value;
        },
    },
    methods: {
        // 将传入的字符串数组转化为对象数组，因为v-model不能绑定字符串数组的单项
        // ['xxx', ...] => [{dir: 'xxx}, ...]
        normalize(list) {
            return list;
        },
        getDefault() {
            return {
                dir: '',
            };
        },
        $getData(list) {
            return this.getLegalList(list || this.sortList).map((item) => item.dir);
        },
    },
}
</script>
