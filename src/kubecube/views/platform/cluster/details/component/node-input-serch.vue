<template>
  <div
    :class="$style.root"
    :align-right="alignRight"
  >
    <el-select v-model="valueType" :class="$style.valueTypeInput">
      <el-option
        label="名称"
        value="name"
      />
      <el-option
        label="标签"
        value="label"
      />
      <el-option
        label="状态"
        value="status"
      />
    </el-select>
    <el-select v-if="valueType === 'status'" v-model="currentValue" :class="$style.input">
      <el-option v-for="(val, key) in nodeStatusMap" :value="key" :key="val" :label="val"/>
    </el-select>
    <el-input
      v-else
      v-model="currentValue"
      :class="$style.input"
      v-bind="$attrs"
      @keydown.enter.native.prevent="search"
      :placeholder="placeholder"
    />
    <el-button
      type="primary"
      :disabled="disabled"
      @click="search"
      style="margin-left:12px"
    >
      搜索
    </el-button>
  </div>
</template>

<script>
export default {
    name: 'KubeInputSearch',
    props: {
        alignRight: Boolean,
        disabled: Boolean,
        nodeStatusMap: Object,
    },
    data() {
        return {
            valueType: 'name',
            currentValue: '',
        };
    },
    computed: {
        placeholder() {
            const map = {
                name: '请输入名称搜索',
                label: '请输入标签搜索,如:a=a',
                status: '请输入状态搜索',
            };
            return map[this.valueType];
        },
    },
    watch: {
        valueType() {
            this.currentValue = '';
        },
    },
    methods: {
        search(event, str) {
            str = str !== undefined ? str : this.currentValue !== undefined ? this.currentValue : '';
            this.$emit('search', { value: str.replace(/^\s+|\s+$/g, ''), valueType: this.valueType});
        },
    },

};
</script>

<style module>
.root { display: flex; text-align: left; }
.root[align-right] { float: right; }

.search[class]{
    position: absolute;
    left: 5px;
    color: #ccc;
}
.valueTypeInput{
  width: 80px;
}
.valueTypeInput :global(.el-input__inner) {
  border-radius: 2px 0 0 2px;
  border-right-width: 0px;
}
.input{
    width: 280px;
    border-radius: 0px 3px 3px 0px;
}
.input :global(.el-input__inner) {
  border-radius: 0px 3px 3px 0px;
}
</style>
