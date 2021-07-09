# 多维表单校验

## 示例
### 基本形式

``` vue
<template>
<u-form gap="large" ref="form" layout="block" @validate="formCanSubmit = $event.valid">
   <u-form-items :rules="rules.httpCode" label="错误码范围" placement="bottom" required>
        <u-input v-model="model.left" :value="model.left" maxlength="4" name="code" placeholder="0-1000内的整数"></u-input>
        <span> - </span>
        <u-input v-model="model.right" :value="model.right" maxlength="4" name="code" placeholder="0-1000内的整数"></u-input>
    </u-form-items>
</u-form>
</template>
<script>
export default {
    data() {
        return {
            model: {
                left: '',
                right: '',
            },
            rules: {
                httpCode: {
                    code: [
                        { type: 'string', required: true, trigger: 'input+blur' },
                        { type: 'string', trigger: 'input+blur', message: '错误码为0-1000内的整数', validator: (rule, value, callback) => {
                            if (/^\d+$/.test(value)) {
                                value = parseInt(value);
                                if (value > 1000 || value < 0)
                                    callback(new Error());
                                else
                                    callback();
                            } else
                                callback(new Error());
                        } },
                        { type: 'string', trigger: 'blur', message: '左边的数值必须小于等于右边的数值', validator: (rule, value, callback) => {
                            parseInt(this.model.left) > parseInt(this.model.right) ? callback(new Error()) : callback();
                        } },
                    ],
                },
            },
        };
    },
};
</script>
```

## FormItems API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| rules | Array | Object | input输入规则，与input name对应 |
| .... | Other | ... | 其余属性同u-form-item |
