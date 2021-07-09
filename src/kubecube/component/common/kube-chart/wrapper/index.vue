<template>
  <div :class="$style.root">
    <div
      :class="$style.header"
    >
      <div
        :class="$style.title"
        :title="title"
      >
        {{ title }}
      </div>
      <div
        v-if="!nooperation"
        :class="$style.toRight"
      >
        <slot name="operations" />
        <i
          :class="$style.refreshIcon"
          @click="refresh"
        />
        <i
          :class="$style.zoomIcon"
          @click="showModal"
        />
      </div>
    </div>
    <component
      :is="chart"
      ref="chart"
      v-bind="chartProps"
    />
    <x-scope
      v-if="!nooperation"
      :init-value="modalChartProps"
    >
      <template slot-scope="{ data, onchange }">
        <chart-modal
          ref="chartmodal"
          :title="title"
          :period-list="periodList"
          :curr-value="data"
          @change="onchange"
        >
          <template slot="operations">
            <slot name="operations" />
          </template>
          <component
            :is="chart"
            ref="chartinmodal"
            v-bind="data"
          />
        </chart-modal>
      </template>
    </x-scope>
  </div>
</template>

<script>
import chartModal from './modal.vue';
export default {
    components: {
        chartModal,
    },
    props: {
        nooperation: {
            type: Boolean,
            default: false,
        },
        height: [ Number, String ],
        meta: Object,
        startTime: Number,
        endTime: Number,
        formatTime: {
            type: Function,
            default: t => t / 1000,
        },
        query: Array,
        legendTemplate: Array,
        title: String,
        periodList: {
            type: Array,
            default: () => ([
                { name: '近6小时', value: 360 * 60 * 1000 },
                { name: '近1天', value: 1440 * 60 * 1000 },
                { name: '近7天', value: 10080 * 60 * 1000 },
            ]),
        },
    },
    computed: {
        chartProps() {
            return {
                startTime: this.startTime,
                endTime: this.endTime,
                formatTime: this.formatTime,
                legendTemplate: this.legendTemplate,
                query: this.query,
                height: this.height,
                meta: this.meta,
            };
        },
        modalChartProps() {
            return Object.assign({}, this.chartProps, {
                height: '400px',
            });
        },
        // modalSlotNode(){
        //     return cloneVNode(data.slots[name])
        // }
    },
    methods: {
        refresh() {
            this.$refs.chart.raceRefresh(true);
        },
        showModal() {
            this.$refs.chartmodal.open();
        },
    },
};
</script>

<style module>
.root{
    border: 1px solid #dfe4ec;
    margin: 5px;
    padding: 5px;
}
.header{
    /* margin: -6px; */
    margin-bottom: 0;
    padding: 0 0 0 10px;
    font-size: 1.2em;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;

}
.header > .title {
    flex: 1;
    /* width: calc(100% - 55px); */
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-align: center;
}
.toRight{
    position: absolute;
    right: 0;
    /* float: right */
    /* display: flex;
    justify-content: flex-end;
    flex: 1;
    text-align: right;
    align-items: center; */
}
.extremeSmall{
    width: 80px!important;
    text-align: left;
}
.extremeSmall + .extremeSmall{
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
</style>
