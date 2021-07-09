<template>
  <div
    :class="$style.root"
    :disabled="disabled"
  >
    <div :class="$style.head">
      <u-popper
        trigger="click"
        :open.sync="yearvisible"
        append-to="reference"
      >
        <div :class="$style.year">
          <span :class="$style.textYear">{{ showYearLocal }}{{ $t('year') }}</span>
        </div>
        <div
          slot="popper"
          :class="$style.yearList"
          @click.stop
        >
          <u-list-view
            :value="showYearLocal"
            @select="yearSelect($event.value)"
          >
            <u-list-view-item
              v-for="(year, index) in yearCol"
              :key="index"
              :class="$style.yearitem"
              :value="year.value"
              :disabled="year.disabled"
            >
              {{ year.value }}{{ $t('year') }}
            </u-list-view-item>
          </u-list-view>
        </div>
      </u-popper>
      <u-popper
        :class="$style.monthPopper"
        trigger="click"
        placement="bottom-end"
        :open.sync="monthvisible"
        append-to="reference"
      >
        <div :class="$style.month">
          <span :class="$style.textMonth">{{ monthTextList[showMonthLocal] }}{{ $t('month') }}</span>
        </div>
        <ul
          slot="popper"
          :class="$style.monthList"
        >
          <li
            v-for="(month, mindex) in monthCol"
            :key="mindex"
            :class="$style.listitem"
            :role="month.value === showMonthLocal+1"
            :disabled="month.disabled"
            @click.stop="monthSelect(month, mindex)"
          >
            {{ monthTextList[month.value - 1] }}
          </li>
        </ul>
      </u-popper>
    </div>
    <div :class="$style.content">
      <div :class="$style.week">
        <span
          :class="$style.dayitem"
          role="week"
        >{{ $t('Sunday') }}</span><span :class="$style.dayitem">{{ $t('Monday') }}</span><span :class="$style.dayitem">{{ $t('Tuesday') }}</span><span :class="$style.dayitem">{{ $t('Wednesday') }}</span><span :class="$style.dayitem">{{ $t('Thursday') }}</span><span :class="$style.dayitem">{{ $t('Friday') }}</span><span
          :class="$style.dayitem"
          role="week"
        >{{ $t('Saturday') }}</span>
      </div>
      <div :class="$style.day">
        <span
          v-for="day in days_"
          :key="day.toDateString()"
          :class="$style.item"
          :sel="!daterangeSwitch && showDate.toDateString() === day.toDateString() ? 'sel' : ''"
          :disabled="!!isOutOfRange(day)"
          :role="showMonthLocal !== day.getMonth() ? 'muted': ''"
          :range="isInRange(day)"
          @click.stop="select(day)"
        >{{ day | format('dd') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { Calendar } from 'cloud-ui.vusion';
const MS_OF_DAY = 24 * 3600 * 1000;
export default {
    name: 'URangeCalendar',
    extends: Calendar,
    props: {
        daterange: Object,
    },
    data() {
        return {
            rangeFlop: true,
            range: this.getDefaultRange(),
            showYearLocal: 2000,
            showMonthLocal: 1,
            daterangeSwitch: false,
        };
    },
    watch: {
        rangeFlop(val) {
            this.daterangeSwitch = false;
            this.caculateRange(val);
            this.$emit('rangechanged', this.range);
        },
        daterange({ min, max }) {
            this.daterangeSwitch = true;
            this.range.min = min;
            this.range.max = max;
            this.range.span = [ this.range.min, this.range.max ];
            // this.rangeFlop = true;
            this.update();
        },
    },
    created() {
        this.showDate = this.transformDate(this.showDate);
        const date = this.showDate;
        const mfirst = new Date(date);
        mfirst.setHours(0, 0, 0, 0);
        this.showDate = mfirst;
        this.showYearLocal = date.getFullYear();
        this.showMonthLocal = date.getMonth();
        this.update();
    },
    mounted() {
        this.$on('select', () => {
            this.rangeFlop = !this.rangeFlop;
        });
        this.caculateRange(this.rangeFlop);
    },
    methods: {
        yearSelect(value) {
            this.showYearLocal = value;
            this.yearvisible = false;
            this.update();
        },
        monthSelect(month) {
            if (!month.disabled) {
                this.showMonthLocal = month.value - 1;
                this.monthvisible = false;
                this.update();
            }
        },
        getDefaultRange() {
            return {
                min: null,
                max: null,
                span: null,
            };
        },
        caculateRange(flop) {
            if (flop) {
                this.range.min = this.transformDate(this.showDate).getTime();
                this.range.max = null;
                this.range.span = null;
            } else {
                const date1 = this.range.min;
                const date2 = this.transformDate(this.showDate).getTime();
                if (date1 > date2) {
                    this.range.max = date1;
                    this.range.min = date2;
                } else {
                    this.range.max = date2;
                }
                this.range.span = [
                    this.range.min, this.range.max,
                ];
            }
        },
        isInRange(day) {
            if (this.range.span) {
                const d = day.getTime();
                const [ min, max ] = this.range.span;
                if (d === min) return 'min';
                if (d === max) return 'max';
                if (d < max && d > min) return 'in';
            }
            return '';
        },
        update() {
            this.days_ = [];
            const year = this.showYearLocal;
            const month = this.showMonthLocal;
            const mfirst = new Date();
            mfirst.setFullYear(year);
            mfirst.setMonth(month);
            mfirst.setDate(1);
            mfirst.setHours(0, 0, 0, 0);
            const mfirstTime = +mfirst;
            const nfirst = new Date(mfirst); nfirst.setMonth(month + 1); nfirst.setDate(1);
            const nfirstTime = +nfirst;
            const lastTime = nfirstTime + ((7 - nfirst.getDay()) % 7 - 1) * MS_OF_DAY;
            let num = -mfirst.getDay();
            let tmpTime;
            let tmp;
            do {
                tmpTime = mfirstTime + (num++) * MS_OF_DAY;
                tmp = new Date(tmpTime);
                this.days_.push(tmp);
            } while (tmpTime < lastTime);
        },
    },
};

</script>

<style module>
@import 'cloud-ui.vusion/src/u-calendar.vue/module.css';
.root {
    width: 238px;
    padding: 4px;
    /* text-align: center; */
    background: $field-background;
    color: #555;
    border: none;
    border-radius: 4px;
    box-sizing: content-box;
    user-select: none;
}

.item[range='in']{
    background-color: #eee;
    color: #fff;
}
.item[range='min']{
    background-color: $brand-primary;
    color: #fff;
}
.item[range='max']{
    background-color: $brand-primary;
    color: #fff;
}
</style>
