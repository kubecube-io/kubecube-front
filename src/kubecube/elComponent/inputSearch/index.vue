<template>
  <div
    :class="$style.root"
    :floatRigth="position === 'right'"
  >
    <div :class="$style.wrap">
      <el-input
        v-model="localValue"
        :placeholder="placeholder"
        clearable
        :disabled="disabled"
        @keydown.enter.native.prevent="handleSearch"
        @clear="handleSearch"
      >
        <i
          slot="prefix"
          class="el-input__icon el-icon-search"
        />
      </el-input>
      <el-button
        type="primary"
        :class="$style.searchBtn"
        :disabled="disabled"
        @click="handleSearch"
      >
        搜索
      </el-button>
    </div>
  </div>
</template>
<script>
export default {
    props: {
        placeholder: {
            type: String,
            default: '请输入名称搜素',
        },
        position: {
            type: String,
            default: 'left',
        },
        value: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            localValue: this.value,
        };
    },
    watch: {
        value(val) {
            this.localValue = val;
        },
        localValue(val) {
            this.$emit('input', val);
            this.$emit('change', val);
        },
    },
    methods: {
        handleSearch() {
            this.$emit('search', this.localValue.trim());
        },
    },
};
</script>
<style module>
.root {
    display: inline-block;
    width: 400px;
}
.wrap {
    display: flex;
}
.searchBtn{
    margin-left: 12px;
}
.root[floatRigth] {
    float: right;
}
</style>
