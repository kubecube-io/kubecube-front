import date from '../utils/filters/date';
import i18n from './i18n';

export default {
    name: 'u-log-time',
    props: {
        strogageName: String,
        min: Number,
        max: Number,
    },
    i18n,
    data() {
        return {
            timeText: '',
            year: '',
            time: '',
            type: 0,
            formCanSubmit: false,
            historyTimes: [],
            open: false,
            rules: {
                time: this.getDateRule(this.min, this.max),
            },
            selectTime: undefined,
        };
    },
    computed: {
        canSubmit() {
            if (this.type === 1)
                return true;
            else
                return this.formCanSubmit;
        },
    },
    created() {
        this.$on('update', (time) => {
            this.selectTime = time;
        });
        this.resetTime();
        this.getHistory();
    },
    methods: {
        resetTime() {
            const nowTime = new Date().getTime();
            this.timeText = '';
            this.year = date.dateFormat(nowTime, 'yyyy-MM-dd');
            this.time = date.dateFormat(nowTime, 'HH:mm:ss');
        },
        getDateRule(min, max) {
            const timesRules = [
                { type: 'string', required: true, trigger: 'input+blur' },
                { type: 'string', pattern: /^[0-9\-\s:]*$/, trigger: 'input', message: this.$t('PleaseEnterTheCorrectTime') },
                { type: 'string', trigger: 'blur', message: this.$t('PleaseEnterTheCorrectTime'), validator: (rule, value, callback) => {
                    if (!value || value === '')
                        callback();
                    const time = isNaN(+value) ? Date.parse(value) : +value;
                    if (isNaN(time))
                        callback(new Error());
                    else
                        callback();
                } },
            ];
            if (min) {
                const minDate = date.dateFormat(min, 'yyyy-MM-dd HH:mm:ss');
                timesRules.push({ type: 'string', trigger: 'blur', message: `${this.$t('DateCannotBeLessThan')}${minDate}`, validator: (rule, value, callback) => {
                    if (!value || value === '' || this.noLimit)
                        callback();
                    const time = isNaN(+value) ? Date.parse(value) : +value;
                    const Year2013 = min;
                    if (isNaN(time))
                        callback(new Error());
                    else {
                        if (time < Year2013)
                            callback(new Error());
                        else
                            callback();
                    }
                } });
            }
            if (max) {
                const maxDate = date.dateFormat(max, 'yyyy-MM-dd HH:mm:ss');
                timesRules.push({ type: 'string', trigger: 'blur', message: `${this.$t('DateCannotBeGreaterThan')}${maxDate}`, validator: (rule, value, callback) => {
                    if (!value || value === '' || this.noLimit)
                        callback();
                    const time = isNaN(+value) ? Date.parse(value) : +value;
                    const Year2013 = max;
                    if (isNaN(time))
                        callback(new Error());
                    else {
                        if (time > Year2013)
                            callback(new Error());
                        else
                            callback();
                    }
                } });
            }
            return timesRules;
        },
        addTime(time) {
            if (!time) {
                if (this.type === 1)
                    time = this.year + ' ' + this.time;
                else
                    time = this.timeText;
                if (/^[0-9]{4}/.test(time))
                    time = Date.parse(time);
                else
                    time = isNaN(+time) ? Date.parse(time) : +time;
            }
            if (isNaN(time)) {
                return;
            }
            if (this.historyTimes[0] !== time) {
                this.historyTimes.unshift(time);
            }
            if (this.historyTimes.length > 2) {
                this.historyTimes.pop();
            }
            localStorage.setItem(this.strogageName, this.historyTimes.join(','));
            this.close();
            this.$emit('update', time);
        },
        getHistory() {
            const historyStr = localStorage.getItem(this.strogageName);
            if (!historyStr)
                return;
            this.historyTimes = historyStr.split(',').map((time) => parseInt(time));
        },
        updateYear(event) {
            const year = `${event.date.getFullYear()}-${event.date.getMonth() + 1}-${event.date.getDate()}`;
            this.year = year;
        },
        updateTime(event) {
            this.time = event.time;
        },
        changeType() {
            const type = this.type;
            if (type) {
                this.type = 0;
            } else {
                this.type = 1;
            }
        },
        getTimeResult(value) {
            if (!value || value === '') {
                return undefined;
            }
            const time = Date.parse(value);
            if (isNaN(time))
                return undefined;
            else
                return date.dateFormat(time, 'yyyy-MM-dd HH:mm:ss');
        },
        close() {
            this.open = false;
        },
        removeSelect() {
            this.selectTime = undefined;
            this.$emit('unselect');
        },
        openTime() {
            this.removeSelect();
            this.open = true;
        },
    },
    filters: {
        dateFormat: date.dateFormat,
    },
};
