<template>
    <div :class="$style.chartWrapper">
        <div v-show="nodata" :class="$style.empty"></div>
        <x-echarts
            :class="$style.echartWrapper"
            :style="`height:${height}px`"
            v-show="!nodata"
            ref="chart"
            :options="chartOption" autoresize></x-echarts>
        <div v-show="!nodata" :class="$style.tablewrapper">
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;"></th>
                        <th :class="$style.pointer" @click="sortLegend">current
                            <svg v-if="sorted" style="display: inline-block;font-size: 85%;vertical-align: text-top;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="css-sr6nr"><path d="M17,9.17a1,1,0,0,0-1.41,0L12,12.71,8.46,9.17a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42l4.24,4.24a1,1,0,0,0,1.42,0L17,10.59A1,1,0,0,0,17,9.17Z"></path></svg>
                        </th>
                    </tr>
                </thead>
                <tbody :style="`height:${height - 40}px`">
                    <tr v-for="lg in legends">
                        <td style="text-align: left;" @click="selectLegend(lg)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                :fill="lg.color"
                                style="vertical-align: text-top;"><path d="M19,11H5a1,1,0,0,0,0,2H19a1,1,0,0,0,0-2Z"></path></svg>
                            <a :class="[$style.pointer, $style.truncate]"
                                :active="lg.active"
                                :title="lg.name">
                                {{ lg.name }}
                            </a>
                        </td>
                        <td :class="$style['graph-legend-value']">{{ lg.data }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import base from './chart.vue';
import { resolveTableLegend } from './util';
export default {
    extends: base,
    data() {
        return {
            legends: [],
            currselect: null,
            sorted: false,
            asc: false,
        };
    },
    mounted() {
        this.sortLegend();
    },
    methods: {
        postModifyOptions(metrics, datas) {
            this.chartOption.legend.show = false;
            this.legends = resolveTableLegend(datas, this.metric, metrics, this.stepTime).map(p => ({
                ...p,
                active: true,
            }));
        },
        selectLegend(lg) {
            this.$refs.chart.dispatchAction({
                type: 'legendToggleSelect',
                name: lg.name,
            });

            this.legends = this.legends.map(l => ({
                ...l,
                active: l.name === lg.name ? !l.active : l.active,
            }));
        },
        sortLegend() {
            this.sorted = true;
            this.legends = this.legends.sort((a, b) => {
                return this.asc ? a.data - b.data : b.data - a.data;
            });
            this.asc = !this.asc;
        },
    },
};
</script>


<style module>
.empty{
    width: 100%;
    height: 240px;
    background: url('cloud-ui.vusion/src/u-chart.vue/assets/empty.png') no-repeat center center;
}
.chartWrapper{
    display: flex;
    flex-direction: row;
}
.echartWrapper {
    flex: 1;

}
.tablewrapper{
    width: 200px;
}
.tablewrapper > table{
    width: 100%;
}

.tablewrapper tbody {
    display: block;
    overflow: auto;
}
.tablewrapper thead,
.tablewrapper tbody tr {
    display:table;
    width:100%;
    table-layout:fixed;/* even columns width , fix width of table too*/
}

.tablewrapper th {
    text-align: right;
    padding: 0 10px 1px 0;
    font-weight: 700;
    color: #33a2e5;
    font-size: 85%;
    white-space: nowrap;
}
.tablewrapper td {
    float: none;
    display: table-cell;
    white-space: nowrap;
    padding: 2px 10px;
    text-align: right;
}
th > .truncate,
td > .truncate{
    width: auto;
    min-width: 0;
    max-width: 100px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    margin-left: 5px;
}
td > .truncate[active]{
    color: #464c54;
}
td > .truncate{
    color: #7b8087;
}

.pointer{
    cursor: pointer;
}
.graph-legend-alias,
.graph-legend-icon {
    float: none;
    display: table-cell;
    white-space: nowrap;
    padding: 2px 10px;
    text-align: right;
}

.graph-legend-icon{
    position: relative;
    width: 5px;
    padding: 0;
    top: 0;
    cursor: pointer;
    font-size: 85%;
}
.graph-legend-alias{
    padding-left: 7px;
    text-align: left;
    width: 95%;
    max-width: 650px;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    overflow: hidden;
}
.graph-legend-value{
    width: 50px;
}
</style>

