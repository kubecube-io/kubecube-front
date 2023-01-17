<template>
  <div class="dynamic-tab">
    <div :class="$style.tabNavBox">
      <div
        v-for="(item, index) in list"
        :key="index"
        :class="[$style.tabNav, index === list.length - 1 ? 'last' : '']"
        :active="index === extendIndex"
        @click="handleExtend(index)"
      >
        <slot
          v-if="hasTabNavSlot"
          name="tabNav"
          :item="item"
          :index="index"
        />
        <template v-else-if="miniFormatter">
          {{ miniFormatter(item, index) }}
        </template>
        <template v-else>
          {{ item[textField] || '-' }}
        </template>
        <template v-if="delBtnDisable">
          <i
            v-if="showDeleteBtn && !disabled"
            :class="['el-icon-close', $style.deleteBtn]"
          />
        </template>
        <template v-else>
          <i
            v-if="showDeleteBtn && !disabled"
            :class="['el-icon-close', $style.deleteBtn]"
            @click.stop="handleDelete(index)"
          />
        </template>
        <i
          v-if="validateFile && hasError(index, validateStatus)"
          :class="['el-icon-warning', $style.errorIcon]"
        />
      </div>
      <template v-if="addBtnDisable">
        <i
          v-if="showAddBtn && !disabled"
          :class="['el-icon-circle-plus', $style.addBtn]"
        />
      </template>
      <template v-else>
        <i
          v-if="showAddBtn && !disabled"
          :class="['el-icon-circle-plus', $style.addBtn]"
          @click="handleAdd"
        />
      </template>
    </div>
    <div
      v-for="(item, index) in list"
      v-show="extendIndex === index"
      :key="index"
      :class="$style.navContent"
    >
      <slot
        :item="item"
        :index="index"
        :disabled="disabled"
      />
    </div>
  </div>
</template>
<script>
export default {
    name: 'DynamicTab',
    inject: [ 'elForm' ],
    props: {
        value: {
            type: Array,
            default: () => [],
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        showDeleteBtn: {
            type: Boolean,
            default: true,
        },
        showAddBtn: {
            type: Boolean,
            default: true,
        },
        getDefaultItem: {
            type: Function,
            default: () => {
                return {};
            },
        },
        initialAdd: {
            type: Boolean,
            default: true,
        },
        minCount: {
            type: Number,
            default: 1,
        },
        maxCount: {
            type: Number,
            default: Infinity,
        },
        overMaxCountTipFormatter: {
            type: Function,
            default: maxCount => `最多只能添加${maxCount}个`,
        },
        underMinCountTipFormatter: {
            type: Function,
            default: minCount => '无法删除',
        },
        textField: {
            type: String,
            default: 'title',
        },
        activeIndex: {
            type: Number,
            default: 0,
        },
        addButtonText: {
            type: String,
            default: '添加',
        },
        validateFile: {
            type: String,
            default: '',
        },
        miniFormatter: {
            type: Function,
            default: null,
        },
    },
    data() {
        return {
            extendIndex: this.activeIndex,
            list: this.value,
            validateStatus: this.value.map(item => ({})),
        };
    },
    computed: {
        addBtnDisable() {
            return this.list.length >= this.maxCount;
        },
        delBtnDisable() {
            return this.list.length <= this.minCount;
        },
        hasTabNavSlot() {
            return this.$scopedSlots && this.$scopedSlots.hasOwnProperty('tabNav');
        },
    },
    watch: {
        list(val) {
            this.$emit('input', val);
            this.validateStatus = val.map(item => ({}));
        },
        value(val) {
            this.list = val;
        },
        extendIndex(val) {
            this.$emit('update:activeIndex', val);
        },
        activeIndex(val) {
            this.extendIndex = val;
        },
    },
    created() {
        if (this.initialAdd && this.list.length < this.minCount) {
            const arr = [];
            for (let i = this.list.length; i < this.minCount; i++) {
                arr.push(this.getDefaultItem());
            }
            this.list.push(...arr);
        }
    },
    mounted() {
        this.elForm && this.elForm.$on('validate', this.validateListener);
    },
    destroyed() {
        this.elForm && this.elForm.$off('validate', this.validateListener);
    },
    methods: {
        removeTab(a, b, c, d) {
            console.log(a, b, c, d);
        },
        hasError(index, validateFile) {
            const status = validateFile[index];
            const keys = status ? Object.keys(status) : [];
            return keys.some(key => status[key] && !status[key].valid);
        },
        getErrorMessage(index, validateFile) {
            const status = validateFile[index];
            const keys = status ? Object.keys(status) : [];
            const key = keys.find(key => status[key] && !status[key].valid);
            return status[key] && status[key].message;
        },
        handleExtend(index) {
            this.extendIndex = index;
        },
        handleDelete(index) {
            if (this.delBtnDisable) {
                return;
            }
            const delItem = this.list[index];
            if (this.$listeners.hasOwnProperty('beforeRemove')) {
                this.$emit(
                    'beforeRemove',
                    {
                        item: delItem,
                        index,
                        data: this.list,
                        okCallBack: () => {
                            // ok
                            this.list.splice(index, 1);
                            if (this.extendIndex >= this.list.length) {
                                this.extendIndex--;
                            }
                        },
                        cancelCallBack: () => {

                        },
                    },
                    this
                );
            } else {
                this.list.splice(index, 1);
                console.log(this.extendIndex >= this.list.length);
                if (this.extendIndex >= this.list.length) {
                    this.extendIndex--;
                }
            }
        },
        handleAdd() {
            const addItem = this.getDefaultItem();
            const index = this.list.length;
            if (this.$listeners.hasOwnProperty('beforeAdd')) {
                this.$emit(
                    'beforeAdd',
                    {
                        item: addItem,
                        index,
                        data: this.list,
                        okCallBack: () => {
                            // ok
                            this.extendIndex = index;
                            this.list.push(addItem);
                        },
                        cancelCallBack: () => {

                        },
                    },
                    this
                );
            } else {
                this.extendIndex = index;
                this.list.push(addItem);
            }

        },
        validateListener(prop, valid, message) {
            if (this.validateFile && prop.startsWith(`${this.validateFile}.`)) {
                const index = prop.slice(`${this.validateFile}`.length).split('.')[1];
                this.validateStatus[index][prop] = { valid, message };
                this.validateStatus = [ ...this.validateStatus ];
            }
        },
    },
};
</script>
<style module>
.tabNavBox {
    width: 100%;
    border-bottom: 1px solid #e4e7ed;
    min-height: 40px;
}
.tabNav {
    padding: 0 24px;
    line-height: 38px;
    display: inline-block;
    border: 1px solid #e4e7ed;
    margin-bottom: -1px;
    position: relative;
    box-sizing: border-box;
    height: 40px;
    cursor: pointer;
    margin-left: -1px;
}
.tabNav:first-child{
    border-top-left-radius: 4px;
}
.tabNav:global(.last){
    border-top-right-radius: 4px;
}
.tabNav[active] {
    color: #37f;
    border-bottom: 1px solid #fff;
}
.addBtn {
    font-size: 20px;
    margin-left: 8px;
    color: #37f;
    cursor: pointer;
}
.deleteBtn {
    font-size: 14px;
    color: #ccc;
    cursor: pointer;
    position: absolute;
    top: 12px;
    right: 4px;
}
.deleteBtn:hover {
    color: #37f;
}
.navContent {
    padding: 20px 20px 0;
}
.errorIcon {
    font-size: 14px;
    color: #f54545;
    cursor: pointer;
    position: absolute;
    top: 12px;
    left: 4px;
}

</style>
