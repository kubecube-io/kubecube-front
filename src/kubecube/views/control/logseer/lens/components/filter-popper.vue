<template>
    <u-popper trigger='manual' :open.sync="editVisible" appendTo="reference">
        <u-popper v-if="model" trigger='hover' :open.sync="visible" appendTo="reference">
            <span :class="$style.root" ref="spanRoot" @click.stop>
                <u-linear-layout :class="$style.chip" gap="ext-small" :disabled="model.disable">
                    <u-text>{{model.key}}</u-text>
                    <u-text>{{model.operator | operatorFilter }}</u-text>
                    <u-text>{{model.value}}</u-text>
                    <!-- <span :class="$style.close" @click.stop="onDelete"></span> -->
                </u-linear-layout>
            </span>
            <div slot="popper" :class="$style.toplayer" @click.stop>
                <filter-operation-input v-if="!editVisible"
                    :state="model.disable"
                    @edit="editVisible = true"
                    @remove="onDelete"
                    @disable="onDisable"/>
            </div>
        </u-popper>
        <span v-else :class="$style.root" ref="spanRoot">
            <span :class="[$style.chip, $style.point]" @click="editVisible=true"></span>
        </span>
        <div slot="popper" :class="$style.toplayer" @click.stop>
            <filter-condition-input ref="input" v-if="editVisible" @change="onChange" @cancel="onCancel"/>
        </div>
    </u-popper>
</template>

<script>
import filterConditionInput from './filter-condition-input.vue';
import filterOperationInput from './filter-operators.vue';
import { OPERATOR_MAP, operators } from './filter-utils';
export default {
    filters: {
        operatorFilter(val) {
            return OPERATOR_MAP[val];
        },
    },
    components: {
        'filter-condition-input': filterConditionInput,
        'filter-operation-input': filterOperationInput,
    },
    props: {
        value: Object,
        empty: Boolean,
    },
    data() {
        return {
            model: this.value || null,
            visible: false,
            editVisible: false,
        };
    },
    watch: {
        // visible(val){
        //     if(!val){
        //         this.editVisible = false
        //     }
        // },
        editVisible(val) {
            if (val) {
                this.$nextTick(() => {
                    this.$refs.input.open(this.model);
                });
            }
        },
        value(val) {
            this.model = val;
        },
    },
    methods: {
        onCancel() {
            this.editVisible = false;
        },
        onChange(model) {
            const isCreate = !this.model;
            if (!this.empty) {
                this.model = model;
            }
            this.editVisible = false;
            this.$emit(isCreate ? 'create' : 'change', model);
        },
        onDelete() {
            this.model = null;
            this.$emit('delete');
        },
        onDisable(value) {
            console.log(value);
            this.$emit('change', Object.assign({}, this.model, { disable: value }));
        },
    },
};
</script>

<style module>
.root{
    -moz-user-select:none; /*火狐*/
    -webkit-user-select:none; /*webkit浏览器*/
    -ms-user-select:none; /*IE10*/
    -khtml-user-select:none; /*早期浏览器*/
    user-select:none;
    display: inline-block;
    cursor: pointer;
    margin-right: 10px;
}
.chip{
    position: relative;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    display: inline-block;
    height: 24px;
    padding: 0 12px;
    border-radius: 12px;
    font-size: 14px;
    color: #fff;
    border: 1px solid $brand-primary;
    vertical-align: middle;
    background-color: $brand-primary;
}
.chip[gap="ext-small"] > :not(:last-child){
    margin-right: 2px;
}
.chip[disabled="disabled"]{
    color: $brand-disabled;
    border-color: $brand-disabled;
    background-color: #fff;
}

.point{
    background-color: #fff!important;
    width: 24px;
    height: 24px;
    padding: 0!important;
    border-radius: 100%;
    border: none!important;
}
.point::after{
    display: block;
    content: ' ';
    width: 24px;
    height: 24px;
    text-align: center;
    background: url(./assets/ic_add@2x.png) center center/24px 24px no-repeat;
}
.point:hover::after{
    background-image: url(./assets/ic_add_hover@2x.png);
}
.close{
    display: inline-block;
    vertical-align: bottom;
}
.close:hover::after{
    background-image: url(./assets/ic_close_hover@2x.png);
}
.close::after{
    display: block;
    content: ' ';
    width: 28px;
    height: 28px;
    background: url(./assets/ic_close@2x.png) center center/80% 80% no-repeat;
}
.toplayer{
    z-index: 9999999999;
    background: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
}
</style>
