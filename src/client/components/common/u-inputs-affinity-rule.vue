<template>
    <u-form-table ref="formTable" :dynamic="dynamic" @add="add" @change="onChange" @validate="valid = $event.valid">
        <thead>
            <tr>
                <th width="220px">Key</th>
                <th width="100px">Operator</th>
                <th width="220px">Values</th>
            </tr>
        </thead>
        <tbody>
            <!-- 组件内部的valid检测不抛给全局，因为使用时有开关。如果后续使用有更多的场景，则将global参数暴露 -->
            <tr is="u-form-table-tr" v-for="(item, index) in sortList" :key="index" :rules="rules" @remove="remove(index)" :global="false" :can-be-empty="canBeEmpty" :is-empty="isEmpty.bind(this)">
                <td><u-input size="huge" name="key" v-model="item.key"></u-input></td>
                <td><u-select v-model="item.operator" size="huge" :data="sortOperators" @select="onSelect($event, item)"></u-select></td>
                <td v-if="item.hasValue"><u-input key="value" size="huge" name="values" v-model="item.values" :placeholder="item.operator | getPlaceholder"></u-input></td>
                <td v-else><u-input key="none" disabled size="huge" value="无需填写values"></u-input></td>
            </tr>
        </tbody>
    </u-form-table>
</template>

<script>
import { Inputs } from '@micro-app/common/base/mixins';

export default {
    name: 'u-inputs-affinity-rule',
    mixins: [ Inputs ],
    filters: {
        getPlaceholder(operator) {
            return ['In', 'NotIn'].includes(operator) ? '可输入多个值，用空格分割' : '请输入整数数值';
        },
    },
    props: {
        disabled: { type: Boolean, default: false },
        operators: Array,
        // type: { type: String, default: 'nodeAffinity' },
    },
    data() {
        const keyReg = /(?=^([^/]{1,253}[/])?[^/]{1,63}$)([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*[/])?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]/;
        const valueReg = /(?=^.{1,63}$)[a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?/;
        return {
            dynamic: !this.disabled,
            rules: {
                key: [
                    { type: 'string', pattern: keyReg, trigger: 'input+blur', message: '' },
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => {
                        const instance = this.sortList.filter(((item) => item.key)).map((item) => item.key).sort().find((item, index, arr) => item === arr[index + 1]);
                        this.hasSame = !!instance;
                        instance && instance === value ? callback(new Error()) : callback();
                    }},
                    { type: 'string', trigger: 'blur', message: '该 key 已存在', validator: (rule, value, callback) => {
                        const instance = this.sortList.filter(((item) => item.key)).map((item) => item.key).sort().find((item, index, arr) => item === arr[index + 1]);
                        this.hasSame = !!instance;
                        instance && instance === value ? callback(new Error()) : callback();
                    }},
                    { type: 'string', trigger: 'input+blur', message: '', validator: (rule, value, callback) => {
                        this.sortList.some((item) => !value && !item.key && item.values) ? callback(new Error()) : callback();
                    } },
                ],
                values: [
                    { type: 'string', trigger: 'input+blur', message: '', validator: (rule, value, callback) => {
                        const values = value ? value.trim().split(/\s+/) : [];
                        const { key, operator } = this.sortList.find((item) => item.values === value);
                        if(!key || ['Exists', 'DoesNotExist'].includes(operator))
                            callback();
                        else if(['In', 'NotIn'].includes(operator))
                            (values.length && values.every((item) => valueReg.test(item))) ? callback() : callback(new Error());
                        else
                            (values.length === 1 && valueReg.test(values[0])) ? callback() : callback(new Error());
                    }},
                ],
            },
            sortOperators: this.operators.map((item) => ({ text: item, value: item})),
        };
    },
    methods: {
        onSelect(event, item) {
            item.hasValue = !['Exists', 'DoesNotExist'].includes(event.value);
        },
        getDefault () {
            return {
                key: '',
                operator: this.operators[0],
                values: '',
                hasValue: true,
            };
        },
        normalize(list) {
            return list.map((item) => Object.assign({}, item, {
                values: item.values ? item.values.join(' ') : undefined,
                hasValue: !['Exists', 'DoesNotExist'].includes(item.operator)
            }));
        },
        isEmpty() {
            const { key, hasValue, values } = (this.sortList[0] || {});
            // operator 为 Exists', 'DoesNotExist'，可以不需要values
            return this.sortList.length === 1 && (hasValue ? !(key && values) : !key);
        },
        $getData() {
            return this.getLegalList().map((item) => ({
                key: item.key,
                operator: item.operator,
                values: ['Exists', 'DoesNotExist'].includes(item.operator) ? undefined : item.values.trim().split(/\s+/),
            }));
        },
    },
}
</script>
