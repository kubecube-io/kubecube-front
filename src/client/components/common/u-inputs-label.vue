<template>
    <u-form-table :class="$style.root" :size="size" ref="formTable" :dynamic="true" @add="add" @change="onChange" @validate="valid = $event.valid">
        <thead>
            <tr>
                <th :class="$style.th" :size="size">
                    Key 
                    <u-note size="large">
                        <div>Key 分为前缀和后缀，以/分隔，可只写后缀。</div>
                        <div>前缀: 0-253位小写字母、数字、"-"、"."组成，以字母或数字开头、结尾，"."之前需为字母或数字。</div>
                        <div>后缀: 1-63位字母、数字、"-"、"_"或"."组成，以字母或数字开头、结尾。</div>
                    </u-note>
                </th>
                <th :class="$style.th" :size="size">Value</th>
            </tr>
        </thead>
        <tbody>
            <tr is="u-form-table-tr" v-for="item in sortExtraList" :key="item.key" disabled ignore>
                <td><u-input disabled size="huge" :value="item.key"></u-input></td>
                <td><u-input disabled size="huge" :value="item.value" :placeholder="valuePlaceholder" maxlength-message="不得超过63个字符" maxlength="63"></u-input></td>
            </tr>
            <tr is="u-form-table-tr" v-for="(item, index) in sortList" :key="index" :rules="rules" @remove="remove(index)" :can-be-empty="canBeEmpty" :is-empty="isEmpty.bind(this)">
                <td><u-input size="huge" name="key" v-model="item.key"></u-input></td>
                <td><u-input size="huge" name="value" v-model="item.value" :placeholder="valuePlaceholder" :title="valuePlaceholder" maxlength-message="不得超过63个字符" maxlength="63"></u-input></td>
            </tr>
        </tbody>
    </u-form-table>
</template>

<style module>
.root[size='large'] {
    width: 750px;
}
.th {
    width: 270px;
}
.th[size="large"] {
    width: 355px;
}
</style>

<script>
import { Inputs } from '@micro-app/common/base/mixins';
import { ignoredKeys } from '@micro-app/common/views/ncs/utils/filters';

export default {
    name: 'u-inputs-label',
    mixins: [Inputs],
    props: {
        size: { type: String, default: 'normal' },
        extraList: { type: [Array, Object], default: () => ({}) },
        canSetSpecialName: { type: Boolean, default: false }, // 是否能设置系统label
    },
    data() {
        const validPattern = /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
        const keyRules = [
            { type: 'string', trigger: 'input+blur', pattern: /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/, message: '' },
            { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => {
                ignoredKeys.some((item) => value.startsWith(item)) ? callback(new Error()) : callback();
            } },
            { type: 'string', trigger: 'blur', message: '不能使用系统标签', validator: (rule, value, callback) => {
                ignoredKeys.some((item) => value.startsWith(item)) ? callback(new Error()) : callback();
            } },
            { type: 'string', trigger: 'blur', message: '该标签选择器已存在', validator: (rule, value, callback) => {
                const instance = this.sortList.filter(((item) => item.key)).map((item) => item.key).sort().find((item, index, arr) => item === arr[index + 1]);
                this.hasSame = !!instance;
                instance && instance === value ? callback(new Error()) : callback();
            } },
            { type: 'string', trigger: 'input+blur', message: '', validator: (rule, value, callback) => {
                this.sortList.some((item) => !value && !item.key && item.value) ? callback(new Error()) : callback();
            } },
        ];

        // todo: 去除对应的rule
        this.canSetSpecialName && keyRules.splice(1, 2);
        return {
            rules: {
                key: keyRules,
                value: [
                    { type: 'string', trigger: 'input+blur', pattern: validPattern, message: '' },
                ],
            },
            sortExtraList: this.normalize(this.extraList),
            valuePlaceholder: '1-63位字母、数字、"-"、"_"或"."组成，以字母或数字开头、结尾，可为空',
        };
    },
    methods: {
        getDefault() {
            return {
                key: '',
                value: '',
            };
        },
        // 使Object的selectorList传入调整为Array
        normalize(list) {
            if (!Object.keys(list).length)
                return [];
            const sortList = [];
            if (!(list instanceof Array)) {
                Object.keys(list).forEach((item, index) => {
                    sortList[index] = {};
                    Object.assign(sortList[index], {
                        key: item,
                        value: list[item],
                    });
                });
            }
            return sortList.length ? sortList : list;
        },
        isEmpty() {
            // value可为空
            return this.sortList.length === 1 && !this.sortList[0].key;
        },
        $getData(list) {
            const tmp = {};
            this.getLegalList(list || this.sortList).map((item) => tmp[item.key] = item.value);
            return tmp;
        },
    },
};
</script>
