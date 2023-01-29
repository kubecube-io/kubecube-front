-   常规使用

```html
<div>这里是需要展示的内容和弹框展示的内容</div>
```

-   需要添加 title、class、width、height 等内容

```html
<div v-tips="{ width:400, title:'这里是测试title',popperClass:'test1 test2',placement:'left' }">这里是需要展示的内容和弹框展示的内容</div>
```

```html
<div v-tips="'这里是自定义的展示内容'">这里是需要展示的内容和弹框展示的内容</div>
```

-   v-tips 可不传数据,不传则直接显示innerText的内容
-   v-tips 传数据时，若直接传的是字符串，则直接显示传入的字符串内容，若所传字符串是空字符串，则触发显示
-   v-tips 传数据时，若传入为对象，仅为设置 popper 的视觉效果，所传参数和 element-ui 的 popover 参数一致。[https://element.eleme.cn/#/zh-CN/component/popover](https://element.eleme.cn/#/zh-CN/component/popover)
-   tip展示位置默认在`上方`显示,触发条件默认是`hover`
