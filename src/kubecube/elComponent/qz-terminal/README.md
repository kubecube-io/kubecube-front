# qz-terminal 终端组件

基于xterm.js实现的页面终端展示组件

## 基础用法
```vue
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
```

## 演示
::: demo
```vue
<<<include(./test/Demo.vue)
```
:::


## Attributes
| 参数               | 说明                                                     | 类型              | 可选值      | 默认值 |
|--------------------|----------------------------------------------------------|-------------------|-------------|--------|
|   ref     |   注册引用信息    |String |   -   |   -   |
|  show | 是否显示 Terminal，支持 .sync 修饰符 |Boolean   |   -   |   false   |
| height |   Terminal高度   |Number |    -   | 400 |
| width | Terminal宽度 |Number | - | 900 |
| options | xterm.js 配置参数 |Object |  | {} |
| beforeCloseCheck | 关闭前确认函数<br />function(ok, cancel) {} 参数两个回调函数<br />确认关闭执行ok()，取消关闭执行cancel()<br />注：仅点击Terminal右上角关闭按钮时触发 |Function | - | - |
> options值详见[xtermjs文档](https://xtermjs.org/docs/)

### Events 说明

| 事件名称          | 说明               | 回调参数                                                     |
| ----------------- | ------------------ | ------------------------------------------------------------ |
| onOpenCallback    | 终端打开后回调     | term实例，<br />通过term.write("string")向终端写入字符串<br />通过term.writeln("string")向终端写入字符串并换行 |
| onResizeCallback  | 终端大小变化后回调 | 终端当前大小， {cols: 62, rows: 18}                          |
| onInputCallback   | 终端输入回调       | 输入字符                                                     |
| onDestroyCallback | 终端关闭后回调     | -                                                            |


<!-- #endregion snippet -->