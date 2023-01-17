<template>
  <div :class="$style.wrap">
    <div :class="$style.table">
      <div :class="$style.thead">
        <div :class="[$style.tr]">
          <div
            v-for="(column, columnIndex) in columns"
            :key="columnIndex"
            :class="$style.td"
          >
            <slot :name="`th-${column.dataIndex}`">
              {{ column.title }}
            </slot>
          </div>
          <div
            v-if="showDeleteBtn"
            :class="$style.td"
          />
        </div>
      </div>
      <div :class="$style.tbody">
        <div
          v-for="(item, itemIndex) in list"
          :key="itemIndex"
          :class="$style.tr"
        >
          <div
            v-for="(column, columnIndex) in columns"
            :key="columnIndex"
            :class="$style.td"
            :style="{ ...(column.width ? { width: column.width } : {}) }"
          >
            <slot
              :name="column.dataIndex"
              :record="item"
              :value="item[column.dataIndex]"
              :index="itemIndex"
              :disabled="disabled"
            >
              {{ item[column.dataIndex] }}
            </slot>
          </div>
          <div
            v-if="showDeleteBtn"
            :class="[ $style.td, $style.deleteWrap ]"
          >
            <i
              v-if="item.disabled || disabled || item.deleteDisabled"
              disabled
              :class="[ 'el-icon-remove-outline', $style.deleteBtn ]"
            />
            <i
              v-else
              :class="[ 'el-icon-remove-outline', $style.deleteBtn ]"
              @click="handleDelete(itemIndex)"
            />
          </div>
        </div>
      </div>
      <div
        v-if="showAddBtn"
        :class="[$style.tr]"
      >
        <td
          :class="$style.td"
          :colspan="colspan"
        >
          <el-button
            :class="$style.addBtn"
            :disabled="disabled"
            icon="el-icon-plus"
            @click="handleAdd"
          >
            {{ addButtonText }}
          </el-button>
        </td>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    props: {
        validateFile: {
            type: String,
            default: '',
        },
        value: {
            type: Array,
            default: () => ([]),
        },
        columns: {
            type: Array,
            default: () => ([]),
        },
        showDeleteBtn: {
            type: Boolean,
            default: true,
        },
        showAddBtn: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
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
        addButtonText: {
            type: String,
            default: '添加',
        },
    },
    data() {
        return {
            list: this.value,
        };
    },
    computed: {
        colspan() {
            return this.showDeleteBtn ? this.columns.length + 1 : this.columns.length;
        },
    },
    watch: {
        list(val) {
            this.$emit('input', val);
        },
        value(val) {
            this.list = val;
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
    methods: {
        handleDelete(index) {
            console.log(index);
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
                            if (this.list.length < this.minCount) {
                                this.list.push(this.getDefaultItem());
                            }
                        },
                        cancelCallBack: () => {

                        },
                    },
                    this
                );
            } else {
                this.list.splice(index, 1);
                if (this.list.length < this.minCount) {
                    this.list.push(this.getDefaultItem());
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
    },
};
</script>
<style module>
.wrap {
  line-height: 32px;
}
.table {
   width: 100%;
   display: table;
   border-collapse: collapse;
}
.thead {
  display: table-header-group;
  color: #909399;
  border-bottom: 1px solid #e5e5e5;
}
.tr {
  display: table-row;
  /* border-bottom: 1px solid #e5e5e5; */
}
.td {
  display: table-cell;
  font-size: 14px;
  box-sizing: border-box;
  vertical-align: middle;
  position: relative;
  padding: 16px 8px 0px;
}
.thead .td {
  padding: 8px;
}
.tbody {
    display: table-row-group;
}
.deleteBtn {
  color: #f54545;
  cursor: pointer;
  font-size: 24px;
  vertical-align: middle!important;;
}
.deleteBtn[disabled=disabled] {
  color: #b2b2b2;
  cursor: not-allowed;
}
.deleteWrap {
  width: 40px;
}
.addBtn {
  width: 100%;
}
</style>
