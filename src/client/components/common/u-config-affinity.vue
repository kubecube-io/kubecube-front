<template>
    <div>
        <u-multi-add ref="multiAdd" :list="sortList" :need-init="needInit" :add-btn-info="addBtnInfo" :mini-formater="miniFormater" :get-default-item="getDefaultItem" :get-error-tip="getErrorTip" size="affinity" @change="changeInputList">
            <div slot-scope="props">
                <u-inputs-affinity-rule :list="props.item.rules" :type="props.item.type" :operators="props.item.operators" :canBeEmpty="!needInit" @validate="validateItem($event, props.item)" @change="props.item.rules = $event.value"></u-inputs-affinity-rule>
            </div>
        </u-multi-add>
    </div>
</template>
<style module>

</style>
<script>

import { cloneDeep, throttle } from 'lodash';

export default {
    name: 'u-config-affinity',
    props: {
        isHostNetworkSupport: { type: Boolean, default: false },
        list: [Array, Object],
        type: { type: String, default: 'nodeAffinity' }, // nodeAffinity || podAffinity || podAntiAffinity
    },
    data() {
        return {
            sortList: this.initList(this.list),
            addBtnInfo: {
                text: '添加规则',
                disabledAdd: false, // 即不限制数量
            },
        };
    },
    computed: {
        needInit() {
            return this.isHostNetworkSupport && ['nodeAffinity', 'podAntiAffinity'].includes(this.type);
        },
    },
    watch: {
        needInit(val){
            if(val){
                this.$refs['multiAdd'].init();
            }
        }
    },
    created() {
        this.validate = throttle(this.validate, 500);
    },
    methods: {
        /** * u-multi-add.vue需要的一些函数 ***/
        getDefaultItem() {
            return {
                type: this.type,
                rules: [],
                operators: this.getOperators(),
            };
        },
        miniFormater(item, index) {
            return '规则' + (index + 1);
        },
        getErrorTip() {
            return '';
        },
        // 只有在列表收起、展开，新增删除才会验证
        changeInputList(event) {
            this.sortList = event.list;
            this.validate();
        },
        /** * u-multi-add.vue需要的一些函数 ***/
        // list为对象
        initList(list = {}) {
            const tmp = this.type === 'nodeAffinity'
                ? (list.requiredDuringSchedulingIgnoredDuringExecution || {}).nodeSelectorTerms
                : list.requiredDuringSchedulingIgnoredDuringExecution;
            return (tmp || []).map((item) => {
                const expressions = this.type === 'nodeAffinity' ? item.matchExpressions : item.labelSelector.matchExpressions;
                return {
                    type: this.type,
                    operators: this.getOperators(),
                    rules: expressions,
                };
            });
        },
        getOperators() {
            // Exists || DoesNotExist 后面不接values
            const operators = ['In', 'NotIn', 'Exists', 'DoesNotExist', 'Gt', 'Lt'];
            return this.type === 'nodeAffinity' ? operators : operators.slice(0, -2);
        },
        validateItem(event, item) {
            item.valid = event.valid;
            this.validate();
        },
        // 整体的验证
        validate(event, item) {
            // sortList可为空
            const valid = !this.sortList.length || this.sortList.some((item) => item.valid);
            this.$emit('validate', { valid });
        },
        $getData() {
            // u-config-affinity组件中，基本只有u-inputs-affinity-rule组件需要传值，所以合法值的筛选就没有必要调用$getData方法
            // 只有空项rules的sortList项需要筛选掉
            const expressions = this.sortList.filter((item) => item.rules.some((item) => item.key)).map((item) => ({
                matchExpressions: item.rules.map((item) => ({
                    key: item.key,
                    operator: item.operator,
                    values: ['Exists', 'DoesNotExist'].includes(item.operator) ? undefined : item.values.trim().split(/\s+/),
                })),
            }));
            if (this.type === 'nodeAffinity') {
                return expressions;
            } else
                return expressions.map((item) => ({
                    labelSelector: item,
                    topologyKey: 'kubernetes.io/hostname',
                }));
        },
    },
};
</script>
