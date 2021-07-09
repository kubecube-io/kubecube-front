# 面包屑导航

## 示例
### 基本形式

``` html
<u-addon name="info">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="help">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="detail">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="readonly">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="readonly2">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```

### 弹出位置

``` html
<u-addon name="info" placement="top">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="help" placement="right">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="detail" placement="left">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="readonly" placement="left">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```
``` html
<u-addon name="readonly2" placement="left">
    <span>该值仅供参考，95带宽按自然月计费</span>
</u-addon>
```

# API
### Props/Attrs

| Prop/Attr | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| name | String | `'info'` | 图标名称 |
| size | Number | `14` | 图标字号 |
| ... | Others | ... | 同u-tooltip参数 |
