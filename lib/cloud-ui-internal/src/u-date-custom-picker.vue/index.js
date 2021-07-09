import i18n from './i18n';
/**
 * [PERIOD_OPTIONS 时间间隔options的所有选项值]
 * @type {Array}
 */

const ONE_MINUTE = 1000 * 60;

const initPeriodOptionsMethod = function (interval, ONE_MINUTE, sender) {
    let start;
    let end;
    if (interval <= ONE_MINUTE * 12) {
        start = 0;
        end = 1;
    } else if (interval <= ONE_MINUTE * 60) {
        start = 0;
        end = 2;
    } else if (interval <= ONE_MINUTE * 60 * 3) {
        start = 0;
        end = 3;
    } else if (interval <= ONE_MINUTE * 60 * 12) {
        start = 1;
        end = 4;
    } else if (interval <= ONE_MINUTE * 60 * 24 * 2) {
        start = 2;
        end = 5;
    } else if (interval <= ONE_MINUTE * 60 * 24 * 12) {
        start = 3;
        end = 6;
    } else if (interval <= ONE_MINUTE * 60 * 24 * 48) {
        start = 4;
        end = 7;
    } else if (interval <= ONE_MINUTE * 60 * 24 * 60) {
        start = 5;
        end = 8;
    } else {
        start = 5;
        end = 8;
    }
    const periodOptions = this.PERIOD_OPTIONS.slice(start, end);
    // 每列三个值，取第二个值
    return periodOptions;
};

export default {
    name: 'u-date-custom-picker',
    i18n,
    props: {
        /* 时间选择的options */
        timeRange: {
            type: Array,
            default() {
                return [
                    { value: 3 * 60 * 60 * 1000, name: this.$t('3hours') },
                    { value: 24 * 60 * 60 * 1000, name: this.$t('24hours') },
                    { value: 2 * 24 * 60 * 60 * 1000, name: this.$t('48hours') },
                    { value: 7 * 24 * 60 * 60 * 1000, name: this.$t('7days') },
                ];
            },
        },
        noInterval: Boolean,
        initPeriodOptionsMethod: {
            type: Function,
            default: initPeriodOptionsMethod,
        },
        datewidth: {
            type: Number,
            default: 90,
        },
        limitDays: {
            type: Number,
            default: 59,
        },
        maxDate: {
            type: Number,
            default: new Date().getTime(),
        },
        date: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        const date = Object.assign({}, this.date);
        return {
            firstMinDate: new Date(),
            menuValue: Object.assign({
                isCustomTime: false,
                startTime: this.maxDate - this.timeRange[0].value,
                endTime: this.maxDate,
                period: this.timeRange[0].value,
                interval: undefined,
            }, date),
            PERIOD_OPTIONS: [
                { value: 60 * 1, name: this.$t('1minute') },
                { value: 60 * 5, name: this.$t('5minute') },
                { value: 60 * 15, name: this.$t('15minute') },
                { value: 60 * 60, name: this.$t('1hour') },
                { value: 60 * 60 * 6, name: this.$t('6hours') },
                { value: 60 * 60 * 24, name: this.$t('1day') },
                { value: 60 * 60 * 24 * 6, name: this.$t('6days') },
                { value: 60 * 60 * 24 * 15, name: this.$t('15days') },
            ],
        };
    },
    mounted() {
        this.update();
    },
    computed: {
        minDate() {
            return this.maxDate - 1000 * 60 * 60 * 24 * this.limitDays;
        },
        firstDate: {
            get() {
                return this.menuValue.startTime;
            },
            set(value) {
                const firstStamp = this.datetostamp(value, this.hourFirstTime, this.minuteFirstTime, 'start');
                this.menuValue.startTime = firstStamp;
            },
        },
        hourFirstTime: {
            get() {
                return new Date(this.menuValue.startTime).getHours();
            },
            set(value) {
                value = +value;
                if (isNaN(value))
                    value = 0;
                if (value > this.maxFirstHour)
                    value = this.maxFirstHour;
                else if (value < 0)
                    value = 0;
                const firstStamp = this.datetostamp(this.firstDate, value, this.minuteFirstTime, 'start');
                this.menuValue.startTime = firstStamp;
            },
        },
        minuteFirstTime: {
            get() {
                return new Date(this.menuValue.startTime).getMinutes();
            },
            set(value) {
                value = +value;
                if (isNaN(value))
                    value = 0;
                if (value > this.maxFirstMin)
                    value = this.maxFirstMin;
                else if (value < 0)
                    value = 0;
                const firstStamp = this.datetostamp(this.firstDate, this.hourFirstTime, value, 'start');
                this.menuValue.startTime = firstStamp;
            },
        },
        secondDate: {
            get() {
                return this.menuValue.endTime;
            },
            set(value) {
                const secondStamp = this.datetostamp(value, this.hourSecondTime, this.minuteSecondTime, 'end');
                this.menuValue.endTime = secondStamp;
            },
        },
        hourSecondTime: {
            get() {
                return new Date(this.menuValue.endTime).getHours();
            },
            set(value) {
                value = +value;
                if (isNaN(value))
                    value = 0;
                if (value < this.minSecoundHour)
                    value = this.minSecoundHour;
                else if (value > 23)
                    value = 23;
                const secondStamp = this.datetostamp(this.secondDate, value, this.minuteSecondTime, 'start');
                this.menuValue.endTime = secondStamp;
            },
        },
        minuteSecondTime: {
            get() {
                return new Date(this.menuValue.endTime).getMinutes();
            },
            set(value) {
                value = +value;
                if (isNaN(value))
                    value = 0;
                if (value < this.minSecoundMin)
                    value = this.minSecoundMin;
                else if (value > 59)
                    value = 59;
                const secondStamp = this.datetostamp(this.secondDate, this.hourSecondTime, value, 'start');
                this.menuValue.endTime = secondStamp;
            },
        },
        maxFirstHour() {
            const firstDate = this.getYearTime(this.menuValue.startTime);
            const secondDate = this.getYearTime(this.menuValue.endTime);
            if (firstDate === secondDate)
                return this.hourSecondTime;
            else
                return 23;
        },
        maxFirstMin() {
            const firstDate = this.getYearTime(this.menuValue.startTime);
            const secondDate = this.getYearTime(this.menuValue.endTime);
            if (firstDate === secondDate && this.hourSecondTime === this.hourFirstTime)
                return this.minuteSecondTime;
            else
                return 59;
        },
        minSecoundHour() {
            const firstDate = this.getYearTime(this.menuValue.startTime);
            const secondDate = this.getYearTime(this.menuValue.endTime);
            if (firstDate === secondDate)
                return this.hourFirstTime;
            else
                return 0;
        },
        minSecoundMin() {
            const firstDate = this.getYearTime(this.menuValue.startTime);
            const secondDate = this.getYearTime(this.menuValue.endTime);
            if (firstDate === secondDate && this.hourSecondTime === this.hourFirstTime)
                return this.minuteFirstTime;
            else
                return 0;
        },
        periodOptions() {
            const interval = this.menuValue.endTime - this.menuValue.startTime;
            const periodOptions = this.initPeriodOptionsMethod(interval, ONE_MINUTE, this);
            this.menuValue.interval = periodOptions.length >= 2 ? periodOptions[1].value : periodOptions[0].value;
            return periodOptions;
        },
    },
    watch: {
        periodOptions(value) {
            const index = +(value.length > 1);
            this.menuValue.interval = value[index].value;
        },
        date(value) {
            // 如果在自定义状态设置period为无效，period保持为切换前的状态
            if (this.menuValue.isCustomTime)
                delete value.period;
            this.menuValue = Object.assign({}, this.menuValue, value);
        },
    },
    methods: {
        getYearTime(date) {
            date = new Date(date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const dtime = date.getDate();
            return year + '/' + month + '/' + dtime;
        },
        datetostamp(date, hour, minute, type) {
            if (!date)
                return;
            if (hour === undefined)
                return;
            if (minute === undefined)
                return;
            date = new Date(date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const dtime = date.getDate();
            let dateTime;
            if (type === 'start')
                dateTime = year + '/' + month + '/' + dtime + ' ' + hour + ':' + minute + ':00';
            else
                dateTime = year + '/' + month + '/' + dtime + ' ' + hour + ':' + minute + ':59';
            return new Date(dateTime).getTime();
        },
        setPeriod(value) {
            if (!this.checkPeriod(value))
                value = this.timeRange[0].value;
            this.menuValue.period = value;
            this.menuValue.endTime = new Date().getTime();
            this.menuValue.startTime = this.menuValue.endTime - value;
            this.$nextTick(() => this.update());
        },
        changeToCustomTime() {
            this.menuValue.isCustomTime = !this.menuValue.isCustomTime;
            if (!this.menuValue.isCustomTime)
                this.setPeriod(this.menuValue.period);
        },
        checkPeriod(value) {
            const periods = this.timeRange.map((range) => range.value);
            return periods.includes(value);
        },
        update() {
            this.$emit('update', Object.assign({}, this.menuValue));
        },
    },
};
