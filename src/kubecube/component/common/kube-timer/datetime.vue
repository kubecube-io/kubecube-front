<template>
  <div :class="$style.root">
    <div :class="$style.wrapper">
      <u-linear-layout
        type="flex"
        gap="small"
        direction="vertical"
      >
        <u-link @click="mode=!mode">
          切换
        </u-link>
        <u-linear-layout
          v-if="mode"
          type="flex"
          :class="$style.timerWrapper"
          gap="small"
          direction="vertical"
        >
          <u-text>时间：</u-text>
          <u-time-picker
            :time="currentStartTime"
            @change="changeTime('startTime', $event.time)"
          />
          <u-text>至</u-text>
          <u-time-picker
            :time="currentEndTime"
            @change="changeTime('endTime', $event.time)"
          />
        </u-linear-layout>
        <u-linear-layout
          v-else
          type="flex"
          :class="$style.timerWrapper"
          gap="small"
          direction="vertical"
        >
          <u-button
            v-for="btn in shortcuts"
            :key="btn.value"
            :color="btn.value === currentSpanTime ? 'primary' : 'normal'"
            @click="changeSpan(btn.value)"
          >
            {{ btn.text }}
          </u-button>
        </u-linear-layout>
      </u-linear-layout>
      <u-custom-calendar
        :daterange="daterange"
        @rangechanged="rangeChanged"
      />
    </div>
    <u-button
      size="large"
      color="primary"
      @click="changeDate"
    >
      确定
    </u-button>
  </div>
</template>

<script>
import calendar from './calendar.vue';
const hour = 60 * 1000 * 60;
const day = 24 * hour;
const DEFAULT_SHORTCUTS = [
    { text: '近1小时', value: hour },
    { text: '近6小时', value: hour * 6 },
    { text: '近1天', value: day },
    { text: '近7天', value: day * 7 },
    { text: '近30天', value: day * 30 },
];
function format(value, type) {
    if (!value) { return; }
    const fix = str => {
        str = '' + (String(str) || '');
        return str.length <= 1 ? '0' + str : str;
    };
    const maps = {
        yyyy(date) { return date.getFullYear(); },
        MM(date) { return fix(date.getMonth() + 1); },
        dd(date) { return fix(date.getDate()); },
        HH(date) { return fix(date.getHours()); },
        mm(date) { return fix(date.getMinutes()); },
        ss(date) { return fix(date.getSeconds()); },
    };
    const trunk = new RegExp(Object.keys(maps).join('|'), 'g');
    type = type || 'yyyy-MM-dd HH:mm';
    if (typeof value === 'string') { value = value.replace(/-/g, '/'); }
    value = new Date(value);
    if (value.toString() === 'Invalid Date') { return; }
    return type.replace(trunk, capture => (maps[capture] ? maps[capture](value) : ''));
}
function resolveTime(date, time) {
    time = time.split(':');
    date.setHours(time[0]);
    date.setMinutes(time[1]);
    date.setSeconds(time[2]);
}
function transformDate(date) {
    if (!date) { return; }
    if (typeof date === 'string') { return new Date(date.replace(/-/g, '/')); } else if (typeof date === 'number') { return new Date(date); } else if (typeof date === 'object') { return date; }
}
export default {
    name: 'UCustomDateTime',
    components: {
        'u-custom-calendar': calendar,
    },
    data() {
        return {
            daterange: undefined,
            mode: false,
            shortcuts: DEFAULT_SHORTCUTS,
            startTime: undefined,
            endTime: undefined,
        };
    },
    computed: {
        currentStartTime() {
            return format(this.startTime, 'HH:mm:ss');
        },
        currentEndTime() {
            return format(this.endTime, 'HH:mm:ss');
        },
        currentSpanTime() {
            return this.endTime.getTime() - this.startTime.getTime();
        },
    },
    created() {
        this.getDefault();
    },
    methods: {
        getDefault() {
            const value = this.shortcuts[0].value;
            this.caculateDate(value);
        },
        caculateDate(span) {
            const date = new Date();
            this.endTime = date;
            this.startTime = new Date(date.getTime() - span);
            this.caculateRange();
        },
        caculateRange() {
            const endDate = new Date(this.endTime);
            const startDate = new Date(this.startTime);
            endDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            this.daterange = {
                min: startDate.getTime(),
                max: endDate.getTime(),
            };
        },
        changeSpan(val) {
            this.caculateDate(val);
        },
        changeTime(key, time) {
            if (!time) { time = '00:00:00'; }
            if (key === 'startTime') {
                const d = new Date(this.daterange.min);
                resolveTime(d, time);
                this.startTime = d;
            }
            if (key === 'endTime') {
                const d = new Date(this.daterange.min);
                resolveTime(d, time);
                this.endTime = d;
            }
        },
        rangeChanged(range) {
            const { min, max } = range;
            const startTime = new Date(min);
            const endTime = new Date(max);
            resolveTime(startTime, this.currentStartTime);
            resolveTime(endTime, this.currentEndTime);
            if (endTime.getTime() > startTime.getTime()) {
                this.startTime = startTime;
                this.endTime = endTime;
            }
        },
        changeDate() {
            this.$emit('change', {
                startTime: transformDate(this.startTime).getTime(),
                endTime: transformDate(this.endTime).getTime(),
            });
        },
        open(startTime, endTime) {
            this.startTime = transformDate(startTime);
            this.endTime = transformDate(endTime);
            this.caculateRange();
        },

    },
};
</script>

<style module>
.root{
    border: 1px solid #d2d6de;
    width: 480px;
    padding: 10px 15px;
    text-align: right;
    background-color: #fff;
}
.wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    text-align: left;
}
.timerWrapper{
    height: 220px;
    width: 200px;
}
</style>
