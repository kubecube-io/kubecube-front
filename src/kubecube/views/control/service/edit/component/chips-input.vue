<template>
  <div :class="$style.root" @click="handleClick">
    <div v-for="(item, index) in chipList" :key="index" :class="$style.chipItem">
      {{item}}
      <i :class="['el-icon-close', $style.deleteBtn]" @click.stop="handleRemoveItem(index)"/>
    </div>
    <div :class="$style.inputWrap">
      <input v-model="inputValue" :class="$style.input" v-show="showInput" ref="input" type="text" @blur="handleInputBlur" @keyup="handleKeyUp"/>
      <div v-if="errorMessage" :class="$style.inputErrorMessage">{{errorMessage}}</div>
    </div>
    
    <div v-if="chipList.length === 0 && !showInput" :class="$style.placeholder">{{placeholder}}</div>
  </div>
</template>
<script>
export default {
  props: {
    prefixProp: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: Array,
      default: () => ([])
    },
    rules: {
      type: Array,
      default: () => ([])
    }
  },
  inject: [ 'elForm' ],
  data() {
    return {
      showInput: false,
      chipList: this.value,
      inputValue: '',
      errorMessage: '',
    }
  },
  watch: {
    value(val) {
      this.chipList = val;
    },
    inputValue(val) {
      if(val.trim()) {
        let res = this.rules.find(item => !item.validator(val.trim(), this.value))
        this.errorMessage = res ? res.message : ''
      } else {
        this.errorMessage = ''
      }
    },
    chipList: {
        handler(val) {
          this.$emit('input', val);
          this.$nextTick(() => {
            this.elForm.validateField(this.prefixProp);
          });
        },
        deep: true,
    },
  },
  methods: {
    handleClick() {
      this.showInput = true;
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    handleInputBlur() {
      if(this.errorMessage) {
        return
      }
      if (!this.inputValue) {
        this.showInput = false;
      } else {
        this.chipList.push(this.inputValue)
        this.inputValue = '';
        this.showInput = false;
      }
    },
    handleRemoveItem(index) {
      this.chipList.splice(index, 1);
    },
    handleKeyUp(event) {
      console.log(event);
      if (event.key === ' ') {
        if(this.errorMessage) {
          this.inputValue = this.inputValue.trim();
          return
        }
        this.chipList.push(this.inputValue.trim());
        this.inputValue = '';
      }
    }
  }
}
</script>
<style module>
.root {
  border: 1px solid #dfe4ec;
  border-radius: 3px;
  transition: border-color .2s;
  height: 120px;
  overflow: auto;
  padding: 4px 10px;
  position: relative;
}
.placeholder {
  position: absolute;
  top: 4px;
  left: 10px;
  font-size: 14px;
  color: #CCCCCC;
}
.chipItem {
  display: inline-block;
  margin: 4px;
  height: 24px;
  line-height: 24px;
  border-radius: 12px;
  background: #E5E5E5;
  padding: 0 10px;
}
.deleteBtn {
  cursor: pointer;
}
.input {
  width: 200px;
  outline: none;
  padding: 0 4px;
  height: 24px;
  border-radius: 12px;
  border: 1px dashed #E5E5E5;
  margin: 0 4px;
}
.inputWrap {
  display: inline;
  position: relative;
  height: 24px;
}
.inputErrorMessage {
  position: absolute;
  color: #f54545;
  font-size: 12px;
  line-height: 1;
  top: 24px;
  left: 12px;
}
</style>
