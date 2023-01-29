<template>
  <div class="dynamic-card">
    <div
      v-for="(item, index) in list"
      :key="index"
      :class="$style.itemWrap"
    >
      <div v-if="extendIndex !== index">
        <div
          :class="$style.closeItemBox"
          @click.stop="handleExtend(index)"
        >
          <div :class="$style.itemTitle">
            <slot
              v-if="hasMinScopedSlot"
              name="mini"
              :item="item"
              :index="index"
            />
            <template v-else-if="miniFormatter">
              {{ miniFormatter(item, index) }}
            </template>
            <template v-else>
              {{ item[textField] || '-' }}
            </template>
          </div>
          <div :class="$style.headRightBox">
            <div :class="$style.actionBox">
              <!-- <qz-icons v-if="validateFile && hasError(index, validateStatus)" name="warn" :class="$style.errorIcon"/> -->
              <el-link
                :class="$style.actionItem"
                type="primary"
              >
                展开
              </el-link>
            </div>
          </div>
        </div>
        <el-alert
          v-if="validateFile && hasError(index, validateStatus)"
          :title="getErrorMessage(index, validateStatus)"
          type="error"
          show-icon
          :closable="false"
        />
      </div>
      <div
        v-show="extendIndex === index"
        :class="$style.openItemBox"
      >
        <div :class="$style.openItemHeadBox">
          <div :class="$style.itemTitle" />
          <div :class="$style.headRightBox">
            <div :class="$style.actionBox">
              <template v-if="delBtnDisable">
                <el-link
                  v-if="showDeleteBtn && !disabled"
                  v-tips="{content: underMinCountTipFormatter(minCount)}"
                  type="primary"
                  :class="$style.actionItem"
                  disabled
                >
                  删除
                </el-link>
              </template>
              <template v-else>
                <el-link
                  v-if="showDeleteBtn && !disabled"
                  type="primary"
                  :class="$style.actionItem"
                  @click="handleDelete(index)"
                >
                  删除
                </el-link>
              </template>
              <el-link
                type="primary"
                :class="$style.actionItem"
                @click="handleClose"
              >
                收起
              </el-link>
            </div>
          </div>
        </div>
        <div :class="$style.openItemBodyBox">
          <slot
            :item="item"
            :index="index"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>
    <div v-if="addBtnDisable">
      <el-button
        v-if="showAddBtn && !disabled"
        v-tips="{content: overMaxCountTipFormatter(maxCount)}"
        disabled
        :class="$style.addBtn"
        icon="el-icon-plus"
      >
        {{ addButtonText }}
      </el-button>
    </div>
    <div v-else>
      <el-button
        v-if="showAddBtn && !disabled"
        :class="$style.addBtn"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        {{ addButtonText }}
      </el-button>
    </div>
  </div>
</template>
<script>
export default {
    name: 'QzDynamicCard',
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
        hasMinScopedSlot() {
            return this.$scopedSlots && this.$scopedSlots.hasOwnProperty('mini');
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
        handleClose() {
            this.extendIndex = -1;
        },
        handleDelete(index) {
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
.addBtn {
    width: 100%;
    display: block;
}
.itemWrap{
    margin-bottom: 15px;
    border: 1px solid #e5e5e5;
}
.closeItemBox {
    background: #f5f5f5;
    min-height: 40px;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}
.itemTitle{
    flex: 1;
}
.headRightBox{
    flex-shrink: 0;
    display: flex;
}
.actionBox{
    display: flex;
}
.actionItem {
   margin-left: 12px;
}
.errorIcon{
  line-height: 20px;
  color: #f54545;
  line-height: 20px !important;
}
.openItemBox {
    background: #fff;
    padding: 0 16px;
}
.openItemHeadBox {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.openItemBodyBox{
    padding: 20px;
}
</style>
