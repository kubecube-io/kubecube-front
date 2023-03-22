<template>
  <div>
    <qz-terminal
      ref="terminal"
      :show.sync="show"
      :height="400"
      :width="600"
      :option="{}"
      :beforeCloseCheck="beforeCloseCheck"
      @onOpenCallback="onOpenCallback"
      @onResizeCallback="onResizeCallback"
      @onInputCallback="onInputCallback"
      @onDestroyCallback="onDestroyCallback"
    />
    <el-button @click="handleOpen">open</el-button>
    <el-button @click="handleClose">close</el-button>
  </div>
</template>
<script>
export default {
    data() {
        return {
            show: false,
            term: null,
            commandHistory: [],
            currentCommand: '',
        };
    },
    methods: {
        handleOpen() {
            this.show = true;
        },
        handleClose() {
            this.show = false;
        },
        beforeCloseCheck(ok, cancle) {
            console.log('beforeCloseCheck');
            ok(); // 确认关闭
            // cancle(); //取消关闭
        },
        onOpenCallback(term) {
            console.log('onOpenCallback');
            this.term = term;
            term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
        },
        onResizeCallback(info) {
            console.log('onResizeCallback');
            console.log(info);
        },
        onInputCallback(str) {
            const c = JSON.stringify(str);
            console.log('onInputCallback', c);
            switch (str) {
                case '\r':
                    console.log('回车符');
                    this.term.write('\r\n');
                    break;
                case '\x7F':
                    console.log('删除');
                    this.term.write('\u0008 \u0008');
                    break;
                case '\u001b[D':
                    console.log('左箭头');
                    this.term.write('\u001b[D');
                    break;
                case '\u001b[C':
                    console.log('右箭头');
                    this.term.write('\u001b[C');
                    break;
                case '\u001b[A':
                    console.log('上箭头');
                    this.term.write('\u001b[A');
                    break;
                case '\u001b[B':
                    console.log('下箭头');
                    this.term.write('\u001b[B');
                    break;
                default:
                    this.currentCommand += str;
                    this.term.write(str);
            }
        },
        onDestroyCallback() {
            console.log('onDestroyCallback');
            this.term = null;
        },
    },
};
</script>
