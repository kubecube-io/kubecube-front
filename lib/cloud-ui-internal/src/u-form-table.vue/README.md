# 表格表单

## 示例
### 基本形式

``` vue
<template>
<u-form>
    <u-form-item label="关联 VPC" layout="block">
        <u-form-table>
            <thead>
                <tr>
                    <th width="170px">区域</th>
                    <th width="170px">VPC</th>
                    <th width="200px">关联描述</th>
                </tr>
            </thead>
            <tbody>
                <tr is="u-form-table-tr" v-for = "(item, index) in model.items" :key="index" :rules="rules.vpcRule" :disabled="model.items.length<=1" @remove="removeItem(index)">
                    <td>
                        <u-input v-model="item.name1" name="name1"></u-input>
                    </td>
                    <td>
                        <u-input v-model="item.name2" name="name2"></u-input>
                    </td>
                    <td>
                        <div>
                            <u-input v-model="item.name3" name="name3" size="huge full" maxlength-message="100字符以内" maxlength="100" placeholder="100字符以内"></u-input>
                        </div>
                    </td>
                </tr>
            </tbody>
        </u-form-table>
    </u-form-item>
</u-form>
</template>
<script>
export default {
    data() {
        return {
            isEdit: false,
            model: {
                items: [
                    {
                        name1: '',
                        name2: '',
                        name3: '',
                    },
                ],
            },
            rules: {
                vpcRule: {
                    name1: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name1不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name1以小写字母开头' },
                        { type: 'string', pattern: /^[a-z0-9-]*$/, trigger: 'input+blur', message: 'name1小写字母、数字或中划线组成' },
                        { type: 'string', pattern: /[a-z0-9]$/, trigger: 'blur', message: 'name1以小写字母或数字结尾' },
                    ],
                    name2: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name2不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name2以小写字母开头' },
                    ],
                    name3: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name3不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name3以小写字母开头' },
                    ],
                },
            },
        };
    },
};
</script>
```

### 动态加数据

``` vue
<template>
<u-form>
    <u-form-item label="关联 VPC" layout="block">
        <u-form-table :dynamic="true" :disabled="false" @add="addItem">
            <thead>
                <tr>
                    <th width="170px">区域</th>
                    <th width="170px">VPC</th>
                    <th width="200px">关联描述</th>
                    <template v-if = "!isEdit">
                        <th width="40px"></th>
                    </template>
                </tr>
            </thead>
            <tbody>
                <tr is="u-form-table-tr" v-for = "(item, index) in model.items" :key="index" :rules="rules.vpcRule" :disabled="model.items.length<=1" @remove="removeItem(index)">
                    <td>
                        <u-input v-model="item.name1" name="name1"></u-input>
                    </td>
                    <td>
                        <u-input v-model="item.name2" name="name2"></u-input>
                    </td>
                    <td>
                        <div>
                            <u-input v-model="item.name3" name="name3" size="huge full" maxlength-message="100字符以内" maxlength="100" placeholder="100字符以内"></u-input>
                        </div>
                    </td>
                </tr>
            </tbody>
        </u-form-table>
    </u-form-item>
</u-form>
</template>
<script>
export default {
    data() {
        return {
            isEdit: false,
            model: {
                items: [],
            },
            rules: {
                vpcRule: {
                    name1: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name1不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name1以小写字母开头' },
                        { type: 'string', pattern: /^[a-z0-9-]*$/, trigger: 'input+blur', message: 'name1小写字母、数字或中划线组成' },
                        { type: 'string', pattern: /[a-z0-9]$/, trigger: 'blur', message: 'name1以小写字母或数字结尾' },
                    ],
                    name2: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name2不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name2以小写字母开头' },
                    ],
                    name3: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name3不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name3以小写字母开头' },
                    ],
                },
            },
        };
    },
    methods: {
        addItem(event) {
            this.model.items.push({
                name1: '',
                name2: '',
                name3: '',
            });
        },
        removeItem(index) {
            this.model.items.splice(index, 1);
        },
    },
};
</script>
```

### 动态加数据冻结

``` vue
<template>
<u-form>
    <u-form-item label="关联 VPC" layout="block">
        <u-form-table :dynamic="true" :disabled="true" @add="addItem">
            <thead>
                <tr>
                    <th width="170px">区域</th>
                    <th width="170px">VPC</th>
                    <th width="200px">关联描述</th>
                    <th width="40px"></th>
                </tr>
            </thead>
            <tbody>
                <tr is="u-form-table-tr" v-for = "(item, index) in model.items" :key="index" :rules="rules.vpcRule" :disabled="model.items.length<=1" @remove="removeItem(index)">
                    <td>
                        <u-input v-model="item.name1" name="name1"></u-input>
                    </td>
                    <td>
                        <u-input v-model="item.name2" name="name2"></u-input>
                    </td>
                    <td>
                        <div>
                            <u-input v-model="item.name3" name="name3" size="huge full" maxlength-message="100字符以内" maxlength="100" placeholder="100字符以内"></u-input>
                        </div>
                    </td>
                </tr>
            </tbody>
        </u-form-table>
    </u-form-item>
</u-form>
</template>
<script>
export default {
    data() {
        return {
            isEdit: false,
            model: {
                items: [
                    {
                        name1: '',
                        name2: '',
                        name3: '',
                    },
                ],
            },
            rules: {
                vpcRule: {
                    name1: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name1不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name1以小写字母开头' },
                        { type: 'string', pattern: /^[a-z0-9-]*$/, trigger: 'input+blur', message: 'name1小写字母、数字或中划线组成' },
                        { type: 'string', pattern: /[a-z0-9]$/, trigger: 'blur', message: 'name1以小写字母或数字结尾' },
                    ],
                    name2: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name2不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name2以小写字母开头' },
                    ],
                    name3: [
                        { type: 'string', required: true, trigger: 'input+blur', message: 'name3不能为空' },
                        { type: 'string', pattern: /^[a-z]/, trigger: 'input+blur', message: 'name3以小写字母开头' },
                    ],
                },
            },
        };
    },
    methods: {
        addItem(event) {
            this.model.items.push({
                name1: '',
                name2: '',
                name3: '',
            });
        },
        removeItem(index) {
            this.model.items.splice(index, 1);
        },
    },
};
</script>
```

## FormTable API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| dynamic | Boolean | `false` | 是否有动态添加项功能 |
| disabled | Boolean | `false` | 是否禁止动态添加按钮 |


### Events

#### @add

增加按钮点击


## FormTableTr API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| rules | Array | `[]` | input验证规则 |
| disabled | Boolean | `false` | 是否禁止动态删除按钮 |


### Events

#### @remove
触发移除事件