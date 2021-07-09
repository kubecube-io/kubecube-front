# 图表

## 示例
### 基本形式

``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor">
</u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: '数据盘读写延时',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: '数据盘读取延时' },
                    { key: 'num', name: '数据盘写入延时' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2018-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2018-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2018-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2018-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2018-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2018-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2018-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### 无弹窗
``` vue
<template>
<u-monitor-chart-panel :no-model="true" style="margin-top:20px;" ref="chartPanel" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: '数据盘读写延时',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: '数据盘读取延时' },
                    { key: 'num', name: '数据盘写入延时' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2018-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2018-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2018-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2018-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2018-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2018-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2018-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### 无刷新
``` vue
<template>
<u-monitor-chart-panel :no-refresh="true" style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: '数据盘读写延时',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: '数据盘读取延时' },
                    { key: 'num', name: '数据盘写入延时' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2018-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2018-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2018-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2018-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2018-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2018-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2018-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### 刷新事件
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" ref="chartPanel" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" @refresh="onRefresh" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: '数据盘读写延时',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: '数据盘读取延时' },
                    { key: 'num', name: '数据盘写入延时' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2018-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2018-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2018-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2018-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2018-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2018-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2018-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
    methods: {
        onRefresh(event) {
            console.log(event);
        },
    },
};
</script>
```

### 自定义数据间距
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :x-axis="metric.xAxis" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :y-axis="metric.yAxis" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: '数据盘读写延时',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: '数据盘读取延时' },
                    { key: 'num', name: '数据盘写入延时' },
                ],
                xAxis: {
                    key: 'timestr',
                    count: 4,
                },
                yAxis: {
                    min: 0,
                    name: '',
                    count: 6,
                },
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2018-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2018-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2018-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2018-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2018-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2018-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2018-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```

### 数据后处理
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :x-axis="metric.xAxis" :y-axis="metric.yAxis" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor" :processor="metric.processor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        const self = this;
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: '数据盘读写延时',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: '数据盘读取延时' },
                    { key: 'num', name: '数据盘写入延时' },
                ],
                xAxis: {
                    key: 'timestr',
                    count: 4,
                },
                yAxis: {
                    min: 0,
                    name: '',
                    count: 6,
                },
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2018-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2018-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2018-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2018-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2018-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2018-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2018-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
                processor(result, modal) {
                    self.metric.unit = 's';
                    return result;
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### 增加图表信息
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :x-axis="metric.xAxis" :y-axis="metric.yAxis" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor" :processor="metric.processor" :content-style ="{top:'115px'}">
    <template slot="titleTemplate" slot-scope="scope">
        <div>
            <span>{{ metric.title }} </span>
        </div>
        <div :class="$style.line">
            <span :class="$style.text" style="width: 50%;">总计 10 次</span>
            <span :class="$style.text" style="width: 50%;">频率 10 次/分</span>
        </div>
    </template>
</u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        const self = this;
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: '数据盘读写延时',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: '数据盘读取延时' },
                    { key: 'num', name: '数据盘写入延时' },
                ],
                xAxis: {
                    key: 'timestr',
                    count: 4,
                },
                yAxis: {
                    min: 0,
                    name: '',
                    count: 6,
                },
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2018-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2018-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2018-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2018-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2018-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2018-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2018-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
                processor(result, modal) {
                    self.metric.unit = 's';
                    return result;
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
<style module>
.line{
    width: 70%;
    margin: auto;
    font-size: 14px;
}
.text {
    white-space: nowrap;
    display: inline-block;
    text-align: center;
    font-size: 18px;
    width: 33.2%;
}
</style>
```
# API
### Props/Attrs

| Prop/Attr | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| dimensions | Array |  | 维度信息，图表请求源数据透传到图表请求处理 |
| filters | Object |  | 维度信息，图表请求源数据透传到图表请求处理 |
| options | Object |  | 维度信息，图表请求源数据透传到图表请求处理 |
| metrics | Object |  | 维度信息，图表请求源数据透传到图表请求处理 |
| optionbarOptions | Object |  | 弹窗条件输入栏参数 |
| modalConfig | Object |  | 图表弹窗传参 |
| unit | String |  | 数据单位 |
| title | String |  | 图表标题 |
| titleAlign | String | 'left' | 图表标题的对齐方式，默认是居中，值有:left,center,right |
| contentStyle | Object | | 图表内容样式 |
| xAxis | Object | { key: 'timestr', count: 6, }| 图表x轴数据展示方式 |
| yAxis | Object | { min: 0,name: '',count: 6, }| 图表y轴数据展示方式 |
| preprocessor | Function |  | 图表请求数据前处理 |
| processor | Function |  | 图表请求数据后处理 |
| noModel | Boolean |  | 隐藏弹窗 |
| noRefresh | Boolean |  | 隐藏刷新 |
| noModalHeader | Boolean |  | 隐藏弹窗表头 |
| templateData | Object |  | 图表模板数据注入 |
| modalTemplateData | Object |  | 图表弹窗模板数据注入 |

## Slots

| Slot  | Description |
| --------- | ---- |
| titleTemplate | 自定义标题内容 |
| captionTemplate | 自定义caption内容 |