# Well

## 示例
### 基本形式

``` vue
<template>
     <u-icon-input style="width:300px" @reset="resetSearch" close @keypress.enter="startSearch" :value="keyWord" v-model="keyWord" placeholder="输入搜索关键词">
    </u-icon-input>
</template>
<script>
export default {
    data() {
        return {
            keyWord: '测试',
        };
    },
    methods: {
        resetSearch($event) {
            // close点击重置搜索内容
        },
        startSearch() {
            // 开始搜索
        },
    },
};
</script>
```

## MonitorOptionbar API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| icon | String | `'search'` | icon种类，仅内置search |
| .... | Other | 同u-input | 同u-input  |


### Events（参见使用的ui库中的u-input）

