# 自定义时间选择控件

## 示例
### 基本形式

``` html
<u-date-custom-picker></u-date-custom-picker>
```

### 无间隔时间

``` html
<u-date-custom-picker :noInterval="true"></u-date-custom-picker>
```

### 时间选择区间设置

``` html
<u-date-custom-picker :limitDays="100"></u-date-custom-picker>
```
### 时间自定义

``` vue
<template>
    <u-date-custom-picker :time-range="timeRange"></u-date-custom-picker>
</template>
<script>
export default {
    data() {
        return {
            timeRange: [
                { name: '近6小时', value: 360 * 60 * 1000 },
                { name: '近1天', value: 1440 * 60 * 1000 },
                { name: '近7天', value: 10080 * 60 * 1000 },
            ],
        };
    },
};
</script>
```
### 自定义时间间隔

``` vue
<template>
    <u-date-custom-picker :time-range="timeRange" :init-period-options-method="initPeriodOptionsMethod"></u-date-custom-picker>
</template>

<script>
const NOS_PERIOD_OPTIONS = [
    { value: 60 * 60, name: '1小时' },
    { value: 60 * 60 * 24, name: '1天' },
];
export default {
    data() {
        return {
            timeRange: [
                { name: '近6小时', value: 360 * 60 * 1000 },
                { name: '近1天', value: 1440 * 60 * 1000 },
                { name: '近7天', value: 10080 * 60 * 1000 },
            ],
        };
    },
    methods: {
        initPeriodOptionsMethod: (interval, ONE_MINUTE, sender) => {
            let periodOptions = NOS_PERIOD_OPTIONS;
            if (interval < ONE_MINUTE * 60 * 24 * 2)
                periodOptions = NOS_PERIOD_OPTIONS.slice(0, 1);
            else if (interval > ONE_MINUTE * 60 * 24 * 12)
                periodOptions = NOS_PERIOD_OPTIONS.slice(1, 2);
            return periodOptions;
        },
    },
};
</script>
```
### 设置日期初始值

``` vue
<template>
    <u-date-custom-picker :date="date"></u-date-custom-picker>
</template>

<script>
export default {
    data() {
        return {
            // 注意此值不可做同步，所有的获值需要手动绑定事件
            date: {
                startTime: new Date('2018-08-20').getTime() - 24 * 60 * 60 * 1000,
                endTime: new Date('2018-08-20').getTime(),
                period: 24 * 60 * 60 * 1000,
                interval: 60 * 60,
            },
        };
    },
};
</script>
```

## DateCustomPicker API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| timeRange | Array | Object | 时间选择区间 |
| noInterval | Boolean | `false`| 无间隔选择 |
| datewidth | Number | `80` | 日期选择框宽度 |
| limitDays | Number | `59` | 限制选择日期范围 |
| maxDate | Number | 当期时间 | 设置最大值 |
| date | Object |  | 设置日期初始值 |

<!-- ### Slots

#### (default) -->

### Events

#### @update

值变化时触发

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event | Object | 改变后的日期信息 |
