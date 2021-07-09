<template>
  <u-popper
    trigger="click"
    :open.sync="visible"
    append-to="reference"
  >
    <div :class="$style.timechip">
      <u-linear-layout gap="small">
        <span :class="$style.chip">{{ startTime | formatLocaleTime }}</span>
        <u-text>至</u-text>
        <span :class="$style.chip">{{ endTime | formatLocaleTime }}</span>
      </u-linear-layout>
    </div>
    <div
      slot="popper"
      :class="$style.topLayer"
      @click.stop
    >
      <u-custom-datetime
        ref="customdatetime"
        @change="timeChanged"
      />
    </div>
  </u-popper>
</template>

<script>
import dateTime from './datetime.vue';
export default {
    components: {
        'u-custom-datetime': dateTime,
    },
    props: {
        startTime: Number,
        endTime: Number,
    },
    data() {
        return {
            visible: false,
        };
    },
    watch: {
        visible(val) {
            if (val) {
                this.$refs.customdatetime.open(this.startTime, this.endTime);
            }
        },
    },
    methods: {
        timeChanged(range) {
            this.visible = false;
            this.$emit('change', range);
        },
    },
};
</script>

<style module>
.topLayer{
    z-index: 99999;
}
.timechip{
    display: inline-block;
    height: 36px;
    line-height: 34px;
    border: 1px solid #dfe4ec;
    border-radius: 3px;
    text-align: center;
    padding: 0 10px;
    cursor: pointer;
}
.timechip[focus]{
    border-color: #8ebee9;
}

.chip{
    position: relative;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    display: inline-block;
    height: 24px;
    line-height: 24px;
    max-width: calc(100% - 30px);
    padding: 0 10px;
    border-radius: 12px;
    font-size: 14px;
    color: #fff;
    vertical-align: middle;
    background-color: $brand-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
