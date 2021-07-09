<template>
  <u-modal
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    :class="$style.modal"
    @close="close"
  >
    <div slot="title">
      <u-linear-layout
        :class="$style.header"
        direction="horizontal"
        gap="small"
        type="flex"
        alignment="center"
      >
        <u-text>{{ title }}</u-text>
        <div :class="$style.toRight">
          <i
            :class="$style.refreshIcon"
            @click="refresh"
          />
        </div>
      </u-linear-layout>
    </div>
    <u-linear-layout
      direction="horizontal"
      type="flex"
      alignment="center"
      justify="space-between"
    >
      <u-date-custom-picker
        ref="dataPicker"
        :time-range="periodList"
        :no-interval="true"
        @update="updateTime"
      />
      <slot name="operations" />
    </u-linear-layout>
    <slot />
  </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/mixins';
export default {
    mixins: [ Modal ],
    props: {
        title: String,
        periodList: Array,
        currValue: Object,
    },
    methods: {
        // 重写 open
        open() {
            this.show = true;
        },

        refresh() {
            this.$slots.default[0].componentInstance.raceRefresh(true);
        },
        updateTime({ startTime, endTime }) {
            this.$emit('change', Object.assign({}, this.currValue, {
                startTime,
                endTime,
            }));
        },
    },

};
</script>

<style module>
.toRight{
    display: flex;
    justify-content: flex-end;
    flex: 1;
    text-align: right;
    align-items: center;
    margin-right: 25px;
}
.header{
    margin: -6px;
    padding: 0 0 0 10px;
}
.extremeSmall{
    width: 100px!important;
    text-align: left;
    margin-left: 5px;
}

.refreshIcon,
.zoomIcon {
    font-size: 16px;
    color: #9ba4ad;
    display: inline-block;
    margin: 6px;
}
.refreshIcon:hover,
.zoomIcon:hover {
    color: #68aaf5;
    cursor: pointer;
}
.refreshIcon {
    left: 75px;
}
.refreshIcon::after {
    icon-font: url('@necfe/cloud-ui-internal/src/assets/svg/chart-refresh.svg');
}
.zoomIcon::after {
    display: inline-block;
    content: ' ';
    width: 14px;
    height: 14px;
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center;
}
.zoomIcon::after {
    icon-font: url('@necfe/cloud-ui-internal/src/assets/svg/chart-zoom.svg');
}
.modal > div {
    width: 80%!important;
}
</style>
