## 基础用法

```html
<qz-link-group max="4">
    <el-link href="https://element.eleme.io" target="_blank">默认链接</el-link>
    <el-link type="primary">主要链接</el-link>
    <el-link type="success">成功链接</el-link>
    <el-link type="warning">警告链接</el-link>
    <el-link type="danger">危险链接</el-link>
    <el-link type="info">信息链接</el-link>
</qz-link-group>
```

## demo演示
::: demo
```html
<template>
    <section class="container">
        <div class="cell">
            <div class="title">max:3</div>
            <qz-link-group>
                <el-link :underline="false">默认链接</el-link>
                <el-link :underline="false" type="primary">主要链接</el-link>
                <el-link :underline="false" type="success">成功链接</el-link>
                <el-link :underline="false" type="warning">警告链接</el-link>
            </qz-link-group>
        </div>
        <div class="cell">
            <div class="title">max:5</div>
            <qz-link-group max="5">
                <el-link :underline="false">默认链接</el-link>
                <el-link :underline="false" type="primary">主要链接</el-link>
                <el-link :underline="false" type="success">成功链接</el-link>
                <el-link :underline="false" type="warning">警告链接</el-link>
                <el-link :underline="false" type="danger">危险链接</el-link>
                <el-link :underline="false" type="info">信息链接</el-link>
            </qz-link-group>
        </div>
    </section>
</template>
<script>
export default {};
</script>
<style>
.cell {
    border: 1px solid #d6d6d6;
    margin: 20px 0;
    padding: 20px;
}
.title {
    margin-bottom: 10px;
    font-weight: bold;
}
</style>

```
:::

## 组件效果说明

- 当子元素中link个数 <= max的值时,正常排列展示
- 当子元素中link个数 > max的值时,正常排列展示 max-1个，剩余的更多下拉框展示

</br>

## Attributes
| 参数      | 说明               |     类型        |    可选值    |   默认值   |
|-----------|-------------------|-----------------|-------------|-----------|
|  max      |  最大展示link个数  | String/Number   |      -      |     3     |
|  isButton |  是否是按钮组 | Boolean         |     -       |   false   |
|  buttonSize |      按钮尺寸    | String          |  medium / small / mini  |   -   |
|  moreType |      更多按钮的类型    | String          |  primary / default / info / danger / success  |   primary   |






<!-- #endregion change -->