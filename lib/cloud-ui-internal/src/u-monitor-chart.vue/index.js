// 勿改动LineChart引用，这个引用从“cloud-ui.vusion”引用出来的是ui主题库中的chart，会引起bug
import LineChart from 'cloud-ui.vusion/src/u-line-chart.vue/index.js';
import date from '../utils/filters/date';

export default {
    name: 'u-monitor-chart',
    mixins: [LineChart],
    props: {
        unit: { type: String, default: '' },
        xAxis: { type: Object, default() {
            return {
                key: 'timestr',
                count: 6,
            };
        } },
        yAxis: { type: Object, default() {
            return {
                min: 0,
                name: '',
                count: 6,
            };
        } },
        options: { type: Object, default() {
            return {
                type: 'monitor',
                startTime: 0,
                endTime: 0,
                period: undefined,
                statistics: 'average',
            };
        } },
        data: {
            type: Array,
            default: () => [],
        },
        metrics: {
            type: Array,
            default: () => [],
        },
        chartSum: { type: Boolean, default: false },
        type: { type: String, default: 'monitor' },
        processor: Function,
        preprocessor: Function,
        dimensions: { type: String, default: '' },
        dataType: { type: String, default: '' },
    },
    data() {
        return {
            fill: true,
            loading: true, // 加载数据
            settings: {},
            legendTemplate: '',
            lengendNum: '', // legend个数，包括更换按钮
        };
    },
    watch: {
        unit(value, oldValue) {
            this.yAxis.name = value;
        },
    },
    created() {
        this.$on('refresh', (data) => {
            this.refresh(data);
        });

        if (this.settings.hasOwnProperty('yAxisMin'))
            this.yAxis.min = this.settings.yAxisMin;
        if (this.settings.hasOwnProperty('xAxisCount'))
            this.xAxis.count = this.settings.xAxisCount;

        if (this.modal)
            this.xAxis.count = 10;
    },
    methods: {
        refresh(data) {
            // todo: 使用watch实现
            this.yAxis.name = this.unit;
            this.loading = true;
            let promise;
            // 如果有预处理，则直接从预处理中获取promise
            if (data)
                promise = Promise.resolve(data);
            else if (this.preprocessor)
                promise = this.preprocessor(this.options, this);
            else {
                // 默认的chart后端请求,这需要本地化的时候自己指定数据，同时返回符合处理结果的数据
                promise = this.defaultProcessor();
            }
            promise.then((data) => {
                const showDate = data[0] ? new Date().toDateString() !== new Date(data[0].timestamp).toDateString() : false;
                data.forEach((item) => {
                    item.timestr = date.dateFormat(item.timestamp, showDate ? 'MM-dd HH:mm' : 'HH:mm');
                    item.datetime = date.dateFormat(item.timestamp, 'yyyy-MM-dd HH:mm');
                });
                return data;
            });
            // 后续处理
            if (this.processor)
                promise = promise.then(this.processor.bind(this));
            promise.then((data) => {
                const showDate = data[0] ? new Date().toDateString() !== new Date(data[0].timestamp).toDateString() : false;
                // 处理图表个数问题
                const TICKES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30, 40, 50, 100, 200, 500, 1000, 1];
                const _xAxisCount = this.xAxis.count || 12;
                let pieceCounts = data.length - 1;
                let tick = pieceCounts / _xAxisCount;
                if (tick !== parseInt(tick)) {
                    tick = 1;
                    while (!(pieceCounts / tick <= _xAxisCount && pieceCounts % tick === 0)) {
                        for (let i = 0; i < TICKES.length; i++) {
                            tick = TICKES[i];
                            if (pieceCounts / tick <= _xAxisCount && pieceCounts % tick === 0)
                                break;
                        }
                        // 如果不能整除，则补充后面的点和相应的横坐标
                        if (tick === 1) {
                            const item = {
                                timestamp: data[pieceCounts].timestamp + (data[pieceCounts].timestamp - data[pieceCounts - 1].timestamp),
                                hidden: true,
                            };
                            item.timestr = date.dateFormat(item.timestamp, showDate ? 'MM-dd HH:mm' : 'HH:mm');
                            item.datetime = date.dateFormat(item.timestamp, 'yyyy-MM-dd HH:mm');
                            data.push(item);
                            pieceCounts++;
                        } else
                            break;
                    }
                }
                return data;
            }).then((data) => {
                this.$emit('loaded', { data, unit: this.unit });
                this.loading = false;
                this.data = data;
            });
        },
        isAlonePoint(data, index, key) {
            return (data[index - 1] && isNaN(data[index - 1][key])) && !isNaN(data[index][key]) && (!data[index + 1] || isNaN(data[index + 1][key]));
        },
        defaultProcessor() {
            return Promise.reject().then(() => {
                console.error('当前的图表引用没有指定service，要使用本图表处理数据，请先本地化自定义defaultProcessor');
            });
        },
    },
};
