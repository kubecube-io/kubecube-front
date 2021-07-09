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
        :class="[$style.item, isChip ? 'u-chip' : '']"
        :title="typeof item === 'string' ? item : formatter(item)"
      >
        {{ typeof item === 'string' ? item : formatter(item) }}</span>
    </div>
    <template v-if="showMoreButton">
      <u-tooltip v-if="!hasModal">
        <span style="display:inline-block;position:absolute;right:0;top:0;bottom:0;">
          <u-link style="padding-left: 5px; vertical-align: text-top;">更多</u-link>
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
          <u-link
            style="padding-left: 5px; vertical-align: text-top;"
            @click="viewMore = true"
          >更多</u-link>
        </span>
        <u-modal
          :visible.sync="viewMore"
          title="查看更多"
          size="huge"
        >
          <div
            v-for="(item, index) in list"
            :key="index"
            class="u-chip"
            :title="item"
          >
            {{ typeof item === 'string' ? item : formatter(item) }}
          </div>
          <div slot="foot" />
        </u-modal>
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
</style>
