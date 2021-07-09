import { Emitter } from 'cloud-ui.vusion';
import i18n from './i18n';

export default {
    name: 'u-monitor-optionbar',
    mixins: [Emitter],
    i18n,
    props: {
        optionbarModules: {
            type: Array,
            default: () => ['type', 'time', 'statistics'],
        },
        menuValueType: [Number, String],
        typeOptions: {
            type: Array,
            default: () => [],
        },
        statisticsOptions: {
            type: Array,
            default() {
                return [
                    { value: 'average', name: this.$t('average') },
                    // {value: 'sum', name: '总和'},
                    { value: 'maxinum', name: this.$t('max') },
                    { value: 'mininum', name: this.$t('min') },
                ];
            },
        },
        initPeriodOptionsMethod: Function,
        typeName: String,
        timeRange: {
            type: Array,
            default() {
                return [
                    { value: 3 * 60 * 60 * 1000, name: this.$t('about3Hours') },
                    { value: 24 * 60 * 60 * 1000, name: this.$t('about24Hours') },
                    { value: 2 * 24 * 60 * 60 * 1000, name: this.$t('about48Hours') },
                    { value: 7 * 24 * 60 * 60 * 1000, name: this.$t('about7days') },
                ];
            },
        },
        noInterval: Boolean,
        startTime: Number,
        endTime: {
            type: Number,
            default: () => new Date().getTime(),
        },
        statistics: { type: String, default: 'average' },
    },
    data() {
        return {
            menuValue: this.initMenuValue(),
        };
    },
    computed: {
        date() {
            const timeList = this.timeRange.map((time) => time.value);
            return {
                startTime: this.menuValue.startTime,
                endTime: this.menuValue.endTime,
                period: this.menuValue.endTime - this.menuValue.startTime,
                isCustomTime: !timeList.includes(this.menuValue.endTime - this.menuValue.startTime),
            };
        },
    },
    methods: {
        /**
         * 根据所选的模块生成对应需要的menuValue属性
         */
        initMenuValue() {
            const menuValue = {};
            if (this.optionbarModules.indexOf('type') !== -1)
                menuValue.type = undefined;
            if (this.optionbarModules.indexOf('time') !== -1) {
                menuValue.startTime = this.startTime || (new Date().getTime() - this.timeRange[0].value);
                menuValue.endTime = this.endTime || new Date().getTime();
                menuValue.interval = undefined;
            }
            if (this.optionbarModules.indexOf('statistics') !== -1)
                menuValue.statistics = this.statistics;
            return menuValue;
        },
        change(event) {
            this.$emit('change', event);
            this.dispatch('u-monitor-chart-panel', 'change', event);
        },
        updateTime(event) {
            this.menuValue.startTime = event.startTime;
            this.menuValue.endTime = event.endTime;
            this.menuValue.interval = event.interval;
            this.change(Object.assign({}, this.menuValue));
        },
        onTypeSelect(value) {
            this.menuValue.type = value;
            this.change(Object.assign({}, this.menuValue));
        },
        onStatisticsSelect(value) {
            this.menuValue.statistics = value;
            this.change(Object.assign({}, this.menuValue));
        },
    },
};
