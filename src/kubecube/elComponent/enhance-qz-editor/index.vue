<template>
  <div class="enhance-qz-editor">
    <div v-if="fullScreen" :class="$style.fullScreenEditor">
      <div :class="$style.header">
          <div  @click="handleZoom" style="line-height: 14px">
             <i style="cursor: pointer" :class="fullScreen ? 'el-icon-close' : 'el-icon-full-screen'"/>
          </div>
      </div>
      <qz-editor
        v-bind="$attrs"
        width="100%"
        height="100%"
        v-model="currentValue"
      />
    </div>
    <div
      v-else
      :class="$style.editor"
    >
      <div :class="$style.header">
          <div @click="handleZoom" style="line-height: 14px">
            <i style="cursor: pointer" :class="fullScreen ? 'el-icon-close' : 'el-icon-full-screen'"/>
          </div>
      </div>
      <qz-editor
        ref="qzEditor"
        v-bind="$attrs"
        v-model="currentValue"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'enhance-qz-editor',
  props: {
    value: {
      type: String,
    },
  },
  data() {
    return {
      currentValue: this.value,
      fullScreen: false,
    }
  },
  watch: {
    value(val) {
      if (val !== this.currentValue) {
        this.currentValue = val;
        if(this.$refs.qzEditor) {
          this.$refs.qzEditor.setValue(val);
        }
      }
    },
    currentValue(val) {
      this.$emit('input', val)
    },
  },
  methods: {
    handleZoom() {
      console.log('handleZoom')
      this.fullScreen = !this.fullScreen;
    }
  }
}
</script>
<style module>
.editor{
  position: relative;
  padding-top: 30px;
}
.editor .header{
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  background: #F5F7FA;
  display: flex;
  padding: 8px;
  justify-content: flex-end
}
.fullScreenEditor {
  padding-top: 30px;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10000;
}
.fullScreenEditor .header{
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  background: #F5F7FA;
  display: flex;
  padding: 8px;
  justify-content: flex-end;
}
</style>