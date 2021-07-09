# 面包屑导航

## 示例
### 基本形式

``` html
<u-log-time strogageName="nlsTime"></u-log-time>
```
### 限制最小日期
``` html
<u-log-time strogageName="nlsTime" :min="new Date('2018-10-11 18:26:22').getTime()"></u-log-time>
```
### 限制最大日期
``` html
<u-log-time strogageName="nlsTime" :max="new Date('2018-10-11 18:26:22').getTime()"></u-log-time>
```

# API
### Props/Attrs

| Prop/Attr | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| strogageName | String |  | LocalStrogage存储的名称 |
| min | Number |  |  限制最小值，时间戳 |
| max | Number |  |  限制最大值，时间戳 |
