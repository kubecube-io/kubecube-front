# 图表选择栏

## 示例
### 基本形式

``` vue
<template>
    <u-monitor-optionbar :optionbar-modules="['time', 'statistics']" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
export default {
    methods: {
        change($event) {
            // $event: {startTime: 开始时间, endTime: '结束时间', interval: '时间间隔', type: '类型', statistics: '数据取值'}
        },
    },
};
</script>
```

### 前缀type选择

``` vue
<template>
    <u-monitor-optionbar type-name="节点" :type-options="typeOptions" :optionbar-modules="['type', 'time', 'statistics']" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
export default {
    data() {
        return {
            typeOptions: [{
                name: 'node-1',
                value: 'node-1',
            }, {
                name: 'node-2',
                value: 'node-2',
            }],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 开始时间, endTime: '结束时间', interval: '时间间隔', type: '类型', statistics: '数据取值'}
        },
    },
};
</script>
```

### 自定义日期间隔与初始化日期

``` vue
<template>
    <u-monitor-optionbar type-name="节点" :type-options="typeOptions" :optionbar-modules="['type', 'time', 'statistics']" :end-time="new Date().getTime()" :start-time="new Date().getTime()-timeRange[2].value" :time-range="timeRange" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
export default {
    data() {
        return {
            typeOptions: [{
                name: 'node-1',
                value: 'node-1',
            }, {
                name: 'node-2',
                value: 'node-2',
            }],
            timeRange: [
                { value: 3 * 60 * 60 * 1000, name: '近3小时' },
                { value: 12 * 60 * 60 * 1000, name: '近12小时' },
                { value: 7 * 24 * 60 * 60 * 1000, name: '近7日' },
            ],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 开始时间, endTime: '结束时间', interval: '时间间隔', type: '类型', statistics: '数据取值'}
        },
    },
};
</script>
```

### 自定义获取数据时间间隔

``` vue
<template>
    <u-monitor-optionbar type-name="节点" :type-options="typeOptions" :optionbar-modules="['type', 'time', 'statistics']" :end-time="new Date().getTime()" :start-time="new Date().getTime()-timeRange[2].value" :init-period-options-method="initPeriodOptionsMethod" :time-range="timeRange" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
const NOS_PERIOD_OPTIONS = [
    { value: 60 * 60, name: '1小时' },
    { value: 60 * 60 * 24, name: '1天' },
];
export default {
    data() {
        return {
            typeOptions: [{
                name: 'node-1',
                value: 'node-1',
            }, {
                name: 'node-2',
                value: 'node-2',
            }],
            initPeriodOptionsMethod: (interval, ONE_MINUTE, sender) => {
                let periodOptions = NOS_PERIOD_OPTIONS;
                if (interval < ONE_MINUTE * 60 * 24 * 3)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(0, 1);
                else if (interval > ONE_MINUTE * 60 * 24 * 12)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(1, 2);
                return periodOptions;
            },
            timeRange: [
                { value: 3 * 60 * 60 * 1000, name: '近3小时' },
                { value: 12 * 60 * 60 * 1000, name: '近12小时' },
                { value: 7 * 24 * 60 * 60 * 1000, name: '近7日' },
            ],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 开始时间, endTime: '结束时间', interval: '时间间隔', type: '类型', statistics: '数据取值'}
        },
    },
};
</script>
```


### 自定义前缀slot与后缀slot

``` vue
<template>
    <u-monitor-optionbar :optionbar-modules="['time']" :end-time="new Date().getTime()" :start-time="new Date().getTime()-timeRange[2].value" :init-period-options-method="initPeriodOptionsMethod" :time-range="timeRange" @change="change($event)">
        <div slot="pre" :class="$style.item">
            <label>前缀种类：</label>
            <!-- 此处建议直接将值存入当前组件在change监听中拼装到chart的options中 -->
            <u-select v-model="node" :data="typeOptions">
            </u-select>
        </div>
        <div slot="after" :class="$style.item">
            <label>后缀种类：</label>
            <!-- 此处建议直接将值存入当前组件在change监听中拼装到chart的options中 -->
            <u-select v-model="afterNode" :data="typeOptions">
            </u-select>
        </div>
    </u-monitor-optionbar>
</template>
<style module>
.item{
    display: inline-block;
    margin-right: 20px;
    margin-top:5px;
}
</style>
<script>
const NOS_PERIOD_OPTIONS = [
    { value: 60 * 60, name: '1小时' },
    { value: 60 * 60 * 24, name: '1天' },
];
export default {
    data() {
        return {
            node: '',
            afterNode: '',
            typeOptions: [{
                text: 'node-1',
                value: 'node-1',
            }, {
                text: 'node-2',
                value: 'node-2',
            }],
            initPeriodOptionsMethod: (interval, ONE_MINUTE, sender) => {
                let periodOptions = NOS_PERIOD_OPTIONS;
                if (interval < ONE_MINUTE * 60 * 24 * 3)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(0, 1);
                else if (interval > ONE_MINUTE * 60 * 24 * 12)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(1, 2);
                return periodOptions;
            },
            timeRange: [
                { value: 3 * 60 * 60 * 1000, name: '近3小时' },
                { value: 12 * 60 * 60 * 1000, name: '近12小时' },
                { value: 7 * 24 * 60 * 60 * 1000, name: '近7日' },
            ],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 开始时间, endTime: '结束时间', interval: '时间间隔', type: '类型', statistics: '数据取值'}
        },
    },
};
</script>
```

## MonitorOptionbar API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| optionbarModules | Array | `['type', 'time', 'statistics']` | 需要包含的默认组件 |
| endTime | Date | `new Date().getTime` | 结束时间 |
| startTime | Date | `endTime-range[0].value` | 开始时间 |
| timeRange | Array |  | 日期间隔时间选择数组 |
| initPeriodOptionsMethod | Function |  | 数据点间隔时间取值 |
| typeName | '' | `''` | 类型名称,仅在type项存在时生效 |
| typeOptions | Array | `[]` | 类型选择数组,仅在type项存在时生效 |


### Events

#### @change

值变化时触发

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event.endTime | Number | 结束时间 |
| $event.startTime | Number | 开始时间 |
| $event.interval | Number | 开始时间与结束时间间隔 |
| $event.type | value | 选择类型 |
| $event.statistics | Number | 数据取点间隔（同步到图表就是x轴相邻点间距） |

## FormTableTr API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| rules | Array | `[]` | input验证规则 |
| disabled | Boolean | `false` | 是否禁止动态删除按钮 |


### Events

#### @remove
触发移除事件