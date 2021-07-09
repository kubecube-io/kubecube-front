import { isEqual, cloneDeep } from 'lodash';
import Vue from 'vue';
/**
 * 动态添加多项（每项的内容【下拉框、input等】不定，个数不定）
 * 需实现函数：getDefault【获取默认对象】、normalize【初始化传入的对象】、$getData【获取定制化的值（接口需要）】
 * 可使用函数：remove【删除一项】、getLegalList【获取合法的列表值】等
 * props: list【父组件传入的多项数据】、canBeEmpty【是否允许无合法项】等
 * 变量：sortList【符合内部数据结构的列表项】、hasSame【是否有重复项】、valid【当前u-inpus-xxx.vue组件的内部数据是否合法】、states【每项是否合法的数据】
 * 例子： u-inputs-label.vue、 u-inputs-env.vue
 */
export default {
    props: {
        readonly: Boolean,
        disabled: Boolean,
        // 如果直接对父组件传入的数据进行转换，会有问题
        list: { type: [Array, Object], default: () => [] },
        needSortValue: { type: Boolean, default: false },
        canBeEmpty: { type: Boolean, default: true }, // 是否能够数值为空（一项合法值都没有）
        needCompare: { type: Boolean, default: false }, // 【todo】是否需要比较数据变化
        global: { type: Boolean, default: true }, // 是否将inputs组件内部的验证也同步到其最近的u-form内【自身的验证不会影响】，使用见：u-inputs-affinity-rule.vue
        needInit: { type: Boolean, default: true }, // 是否初始化一项
        // 使用技巧：因为只会同步到其最近u-form，通过额外包裹一个无实际validate的u-form，也可以起到隔离的作用
    },
    data() {
        return {
            sortList: [],
            legalList: [],
            hasSame: false, // 是否重复项
            states: [], // 当前sortList的各项的state
            valid: false, // 当前的u-inputs-XX.vue组件内部数据是否合法
            timeId: null,

            loadBeforeCreated: true, // 是否是从外界传入list数值
        };
    },
    // 点击收起再展开的过程，会重新初始化当前组件，u-containers-config保存的中间值和sortList完全匹配。不能走this.normalize流程
    // enhance: 修改了u-multi-add.vue组件的v-if -> v-show，收起展开不会再重置内部组件，
    // 即：u-inputs只会created一次，不需要判断 展开收起 || 初始化 区分
    created() {
        if (!this.loadBeforeCreated)
            return;
        if (!this.normalize)
            console.error('error: 请在组件内定义normalize函数');
        if (!this.getDefault)
            console.error('error: 请在组件内定义getDefault函数');
        // u-containers-config保存的中间值肯定是数组（设置时的初始值可能为对象）
        // const keys = Object.keys((this.list.length && this.list[0]) || {});
        // this.defaults不要放在data()函数内，因为函数内部使用到的变量可能也是在data阶段初始化的。会导致意外的报错
        this.defaults = (this.getDefault && this.getDefault()) || {};
        // const defaultKeys = Object.keys(this.defaults);
        // u-containers-config保存的中间值 && 设置页面初始化区分开
        // todo: 后续不需要cloneDeep这个逻辑分支
        // if(keys.length === defaultKeys.length && keys.every((item) => defaultKeys.includes(item)))
        //     this.sortList = cloneDeep(this.list);
        // else
        this.initialize(this.list);
    },
    destroyed() {
        this.timeId && clearTimeout(this.timeId);
    },
    methods: {
        initialize(list) {
            if (list.length || Object.keys(list).length)
                this.sortList = this.normalize(list);
            else if (this.needInit)
                this.add();
        },
        add() {
            this.sortList.push(this.getDefault());
        },
        remove(index) {
            const isError = this.states[index] === 'error';
            this.$nextTick(() => {
                // 删除重复项 || 错误项，需要整体validate
                (this.hasSame || isError) && this.$refs.formTable && this.$refs.formTable.validate();
            });
            if (this.sortList.length === 1 && this.needInit) {
                Vue.set(this.sortList, 0, this.getDefault(true));
                Vue.set(this.states, 0, '');
                // 这里不用this.$nextTick而是setTimeout，是因为数据的更新主要体现在u-form-table-tr内，this.$nextTick感知不到
                this.timeId = setTimeout(() => this.$refs.formTable && this.$refs.formTable.validate());
            } else {
                this.sortList.splice(index, 1);
                this.states.splice(index, 1);
            }

            // 在具体的组件中，remove函数执行完，可接着执行的。(主要是remove函数较复杂，如add方法，可直接覆盖)
            this.afterRemove && this.afterRemove(index);
            this.onChange(this.states);
        },
        onChange(states) {
            this.states = states;
            this.$emit('validate', { valid: this.valid });
            // sortValue 为处理后符合后端接口需求的数据模型，获取的过程需要比对this.defaults，较为耗性能。
            // 通过 needSortValue 控制，默认关闭
            this.$emit('change', this.needSortValue ? {
                sortValue: this.$getData(),
                value: this.sortList,
            } : {
                value: this.sortList,
            });
        },
        // 一般情况下，default项是空项，组件不报错，接口需要的参数需要筛选掉这些项。
        // 但是有的特殊情况，默认项是合法的。这时需要特殊指明 isDefaultTrue 参数为true
        getLegalList(list, isDefaultTrue = false) {
            const tmp = list || this.sortList;
            return isDefaultTrue ? tmp : tmp.filter((item) => !isEqual(item, this.defaults));
        },
        $reset() {
            this.states = [];
            this.sortList = [this.getDefault(true)];
        },
        /**
         * 当 canBeEmpty 的值为 false 时有效，判断this.sortList仅剩的一项是否为无效值。如果无效，则给u-form抛出非法的valid结果。
         *
         * inputs 这里只实现一个通用的逻辑判断，即this.sortList[0]有一个为空的属性时，就判断当前的为无效值
         * u-inputs-xx 组件内如需实现定制化的逻辑，可以直接覆盖该方法
         *
         * @returns {Boolean} - 是否无效值
         */
        isEmpty() {
            return this.sortList.length === 1 && Object.values(this.sortList[0]).some((value) => !value);
        },
    },
};
