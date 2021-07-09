import { Emitter } from 'cloud-ui.vusion';
import i18n from './i18n';

export default {
    name: 'u-monitor-chart-panel',
    mixins: [Emitter],
    i18n,
    props: {
        legend: { type: [Boolean, String], default: true },
        dimensions: String,
        filters: Object,
        preprocessor: Function,
        processor: Function,
        format: Object,
        settings: Object,
        isStatisticHide: { type: Boolean, default: false }, /* 统计指标选项是否隐藏 */
        initTimeRangeSelectedIndex: { type: Number, default: 0 }, /* 默认时间选择选中项索引 */
        timeRange: Array,
        options: {
            type: Object,
            default() {
                return {};
            },
        },
        optionbarOptions: Object,
        modalConfig: {
            type: Object,
            default() {
                return {};
            },
        },
        unit: { type: String, default: '' },
        titleAlign: { type: String, default: 'left' },
        title: { type: String, default: '' },
        width: { type: String, default: '100%' },
        height: { type: String, default: '388px' },
        border: { type: Boolean, default: false },
        contentStyle: Object,
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
        metrics: { type: Array, default: () => [] },
        dataType: { type: String, default: '' },
        chartSum: { type: Boolean, default: false },
        type: { type: String, default: 'monitor' },
        noModel: Boolean,
        noRefresh: Boolean,
        templateData: Object,
        modalTemplateData: Object,
        noModalHeader: Boolean,
    },
    data() {
        return {
            // chart的信息
            data: [],
            loading: false,
            isModalShow: false,
            btnsVisible: true,
            modal: {},
            series: [],
            sumtotal: {
                num: '',
                unit: '',
            },
            modalSumtotal: {
                num: '',
                unit: '',
            },
        };
    },
    created() {
        this.$on('change', (event) => {
            this.change(event);
        });
    },
    methods: {
        getModalSumtotal(event) {
            Object.assign(this.modalSumtotal, event);
        },
        getSumtotal(event) {
            Object.assign(this.sumtotal, event);
        },
        // 这里因为data传递给父组件之后，会全局更新一遍u-monitor-chart的变量，所以如果unit有processor的改动，又会被初始覆盖
        // 所以需要传递unit的变动
        onLoaded(event) {
            Object.assign(this, event);
        },
        refresh(data) {
            // 刷新时，更新时间;
            // 20170519，选择自定义时间段，不需要刷新。
            const options = this.options;
            // if (!options.isCustomTime) {
            //     const crtTime = Date.now();
            //     options.startTime = crtTime + (options.startTime - options.endTime);
            //     options.endTime = crtTime;
            // }
            this.loading = true;
            this.series = this.metrics.map((metric) => ({ key: metric.key, name: metric.name }));
            this.$refs.monitorChart.$emit('refresh', data);
            this.$emit('refresh', options);
        },
        showModal() {
            this.modal = Object.assign({}, {
                unit: this.unit,
                options: Object.assign({}, this.options),
                metrics: this.metrics,
                series: this.series,
                dimensions: this.dimensions,
                filters: this.filters,
                settings: this.settings,
                yAxis: this.yAxis,
                xAxis: this.xAxis,
                legend: this.legend,
                preprocessor: this.preprocessor,
                processor: this.processor ? (result) => this.processor(result, this.modal) : undefined,
            }, this.modalConfig);
            this.$refs.monitorModal && this.$refs.monitorModal.open();
        },
        change(menuValue) {
            Object.assign(this.modal.options, menuValue);
            this.$nextTick(() => this.$refs.monitorModal && this.$refs.monitorModal.refresh());
        },
    },
};
