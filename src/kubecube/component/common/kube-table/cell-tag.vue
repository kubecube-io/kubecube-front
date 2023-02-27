<template>
  <div style="position:relative">
    <div
      :class="[$style.wrap, 'f-toe']"
      :showMoreButton="showMoreButton"
    >
      <span v-if="isEmpty">-</span>
      <span
        v-for="(item, index) in briefList"
        v-else
        :key="index"
        :class="[$style.item, isChip ? $style.customChip : '']"
        :title="typeof item === 'string' ? item : formatter(item)"
      >
        {{ typeof item === 'string' ? item : formatter(item) }}</span>
    </div>
    <template v-if="showMoreButton">
      <u-tooltip v-if="!hasModal">
        <span style="display:inline-block;position:absolute;right:0;top:0;bottom:0;">
          <el-link
            type="primary"
            style="padding-left: 5px; vertical-align: text-top; font-size:inherit;"
          >更多</el-link>
        </span>

        <div slot="content">
          <div
            v-for="(item, index) in list"
            :key="index"
          >
            {{ typeof item === 'string' ? item : formatter(item) }}
          </div>
        </div>
      </u-tooltip>
      <template v-else>
        <span style="display:inline-block;position:absolute;right:0;top:0;bottom:0;">
          <el-link
            type="primary"
            style="padding-left: 5px; vertical-align: text-top; font-size:inherit;"
            @click="viewMore = true"
          >更多</el-link>
        </span>
        <el-dialog
          title="查看更多"
          :visible.sync="viewMore"
          width="800px"
          :close-on-click-modal="false"
        >
          <div style="display: flex; flex-wrap: wrap;">
            <div
              v-for="(item, index) in list"
              :key="index"
              :class="$style.customChip"
              :title="item"
            >
              {{ typeof item === 'string' ? item : formatter(item) }}
            </div>
          </div>
        </el-dialog>
      </template>
    </template>
  </div>
</template>

<script>
export default {
    props: {
        hasModal: Boolean,
        max: { type: Number, default: 1 },
        list: { type: Array, default: () => [] },
        formatter: {
            type: Function,
            default: item => item.text,
        },
        isChip: { type: Boolean, default: false }, // 是否为u-chips组件的单元的样式
    },
    data() {
        return {
            viewMore: false,
        };
    },
    computed: {
        length() {
            return this.list.length || 0;
        },
        briefList() {
            return this.list.slice(0, this.max);
        },
        // 数组中的每项是否字符串
        isString() {
            return typeof this.list[0] === 'string';
        },
        showMoreButton() {
            return this.length > this.max;
        },
        isEmpty() {
            return !this.list.length;
        },
    },

};
</script>


<style module>
.wrap {
    display: inline-block;
    max-width: 100%;
    vertical-align: middle;
}

.wrap[showMoreButton] {
    max-width: calc(100% - 40px);
}

.item[class] {
    max-width: 100%;
}
.customChip {
  position: relative;
  box-sizing: border-box;
  display: inline-block;
  height: 24px;
  line-height: 24px;
  max-width: calc(100% - 30px);
  margin: 5px 10px 5px 0;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 14px;
  color: #666;
  vertical-align: middle;
  background-color: #eef2f7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
