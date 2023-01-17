<template>
  <div :class="$style.root">
    <template v-if="allList.length">
      <div :class="$style.showListWrap">
        <el-tag
          v-for="(label, index) in showList"
          :key="index"
          type="info"
          :title="itemFormatter(label)"
        >
          {{ itemFormatter(label) }}
        </el-tag>
      </div>
      <el-popover
        v-if="moreList.length"
        trigger="hover"
      >
        <div :class="$style.moreListWrap">
          <div
            v-for="(label, index) in allList"
            :key="index"
            :title="itemFormatter(label)"
          >
            {{ itemFormatter(label) }}
          </div>
        </div>
        <el-link
          slot="reference"
          type="primary"
          :class="$style.moreBtn"
        >
          更多
        </el-link>
      </el-popover>
    </template>
    <template v-else>
      -
    </template>
  </div>
</template>
<script>
export default {
    props: {
        showCount: {
            type: Number,
            default: 1,
        },
        data: {
            type: Array,
            default: () => ([]),
        },
        itemFormatter: {
            type: Function,
            default: () => {
                return '';
            },
        },
    },
    computed: {
        showList() {
            return (this.data || []).slice(0, this.showCount);
        },
        allList() {
            return (this.data || []).slice(0);
        },
        moreList() {
            return (this.data || []).slice(this.showCount);
        },
    },
};
</script>
<style module>
.root {
  position: relative;
  max-width: 100%;
  display: flex;
  align-items: center;
}
.moreBtn {
  margin-left: 8px;
}
.showListWrap {
  height: 28px;
  max-width: calc(100% - 36px);
}
.showListWrap :global(.el-tag) {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.moreListWrap {
  display: flex;
  flex-direction: column;
}
</style>
