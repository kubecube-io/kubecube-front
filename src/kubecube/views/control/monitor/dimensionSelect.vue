<template>
  <div :class="$style.wrap">
    <el-button type="primary" @click="handleOpen">维度选择</el-button>
    <el-dialog
      title="维度选择"
      :visible="dialogVisible"
      width="600px"
      @close="close"
      :close-on-click-modal="false"
    >
      <div v-for="(row, rowIndex) in localData" :class="$style.row" :key="rowIndex">
        <div :class="$style.title">
          {{row.name}}
        </div>
        <div :class="$style.content">
          <el-checkbox v-for="(panel, panelIndex) in row.panels" :key="panelIndex" v-model="panel.showPanel">{{panel.title}}</el-checkbox>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash';
export default {
    props: {
        value: {
            type: Array,
            default: () => ([]),
        },
    },
    data() {
        return {
            localData: [],
            dialogVisible: false,
        };
    },
    watch: {
        localData(val) {
            this.$emit('input', val);
        },
        value(val) {
            this.localData = val;
        },
    },
    methods: {
        close() {
            this.dialogVisible = false;
        },
        handleOpen() {
            this.localData = _.cloneDeep(this.value);
            this.dialogVisible = true;
        },
        submit() {
            this.$emit('change', this.localData);
            this.dialogVisible = false;
        },
    },
};
</script>
<style module>
.wrap {
  display: inline-block;
}
.row {

}
.title {

}
.content{
  padding: 8px;
}
</style>
