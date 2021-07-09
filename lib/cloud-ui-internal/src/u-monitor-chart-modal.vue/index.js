import { mapComponents } from '../utils';
import MonitorOptionbar from '../u-monitor-optionbar.vue';
import { Modal } from '../mixins.js';
import i18n from './i18n';

export default {
    mixins: [Modal],
    i18n,
    name: 'u-monitor-chart-modal',
    components: mapComponents([MonitorOptionbar]),
    props: {
        caption: { type: String, default: '' },
        unit: { type: String, default: '' },
        options: {
            type: Object,
            default() {
                return {};
            },
        },
        yAxis: Object,
        xAxis: Object,
        metrics: { type: Array, default: () => [] },
        series: { type: Array, default: () => [] },
        dimensions: String,
        filters: {
            type: Object,
            default() {
                return {};
            },
        },
        templateData: Object,
        contentStyle: Object,
        showChartSwitch: Boolean,
        legend: { type: Boolean, default: true },
        preprocessor: Function,
        processor: Function,
        type: { type: String, default: 'monitor' },
        dataType: { type: String, default: '' },
        chartSum: { type: Boolean, default: false },
        title: String,
    },
    data() {
        return {
            data: [],
        };
    },
    methods: {
        open() {
            this.show = true;
            this.$nextTick(() => this.refresh());
        },
        refresh() {
            this.$refs.monitorModalChart && this.$refs.monitorModalChart.refresh();
        },
        change(menuValue) {
            Object.assign(this.modal.options, menuValue);
            this.$nextTick(() => this.refresh());
        },
        onLoaded(event) {
            Object.assign(this, event);
        },
        getSumtotal(event) {
            this.$emit('sumtotal', event);
        },
    },
};
