<template>
  <span>
    <u-number-input
      v-model="interval"
      size="small"
      style="text-align:left;width: 4em;    vertical-align: bottom;"
      :min="1"
    />
    <u-select
      v-model="unit"
      size="small"
      style="margin-left: 5px;text-align:left;width: 4em;    vertical-align: bottom;"
    >
      <u-select-item value="d">天</u-select-item>
      <u-select-item value="h">时</u-select-item>
      <u-select-item value="m">分</u-select-item>
    </u-select>
  </span>
</template>

<script>
import { mapState } from 'vuex';
export const map = {
    d: 60 * 60 * 1000 * 24,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
};
export function intervalToTimestamp(val) {
    const result = /(\d+)([dhm])/.exec(val);
    if (result) {
        const [ _, num, unit ] = result;
        return +num * map[unit];
    }
    return null;
}
export default {
    inject: [ 'forceToRefresh' ],
    data() {
        return {
            interval: 1,
            unit: 'm',
        };
    },
    computed: {
        intervalString() {
            return `${this.interval}${this.unit}`;
        },
        ...mapState({
            intervalLens: state => state.timer.interval,
        }),
    },
    watch: {
        intervalString(val) {
            this.$store.commit('timer/setInterval', val);
        },
        intervalLens(val) {
            this.handleData(val);
            this.forceToRefresh();
        },
    },
    mounted() {
        this.handleData(this.intervalLens);
    },
    methods: {
        handleData(val) {
            const result = /(\d+)([dhm])/.exec(val);
            if (result) {
                const [ _, num, unit ] = result;
                this.interval = +num;
                this.unit = unit;
            }
        },
        getInterval() {
            const unit = this.unit;
            return this.interval * map[unit];
        },
    },
};
</script>

<style>

</style>
