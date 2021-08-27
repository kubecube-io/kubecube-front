<template>
  <div
    :class="{ [$style.scrollable]: !!maxHeight }"
    :style="{ maxHeight: maxHeight }"
  >
    <table
      :class="$style.root"
    >
      <colgroup>
        <col
          v-for="(column, index) in columns"
          :key="column.name"
          :width="columnWidth[index]"
        >
      </colgroup>
      <thead
        @mousemove="onResizing($event)"
        @mouseup="onEndResize()"
      >
        <tr ref="theadtr">
          <th-comp
            v-for="(column, index) in columns"
            :key="column.name"
            :topslots="$scopedSlots"
            :item-key="itemKey"
            :column="column"
            :rows="items"
            :width="columnWidth[index]"
            :max-height="maxHeight"
            :column-meta="columnMeta[index]"
            :resizable="index < columns.length - 1 ? resizable : false"
            @beginResize="onbeginResize"
            @sort="onColumnSort"
          />
        </tr>
        <tr :class="$style.progress">
          <th :colspan="columns.length">
            <div :class="$style.progressbar">
              <div :style="progressStyle" />
            </div>
          </th>
        </tr>
      </thead>
      <template v-if="loading && items.length === 0">
        <tbody>
          <!-- <colgroup v-if="maxHeight">
          <col :width="tableWidth">
        </colgroup> -->
          <tr>
            <td
              :colspan="columns.length"
              style="text-align:center"
            >
              加载中...
            </td>
          </tr>
        </tbody>
      </template>
      <template v-else>
        <tbody v-if="error">
          <!-- <colgroup v-if="maxHeight">
          <col :width="tableWidth">
        </colgroup> -->
          <tr>
            <td
              :colspan="columns.length"
              style="text-align:center"
            >
              <slot name="error" />
            </td>
          </tr>
        </tbody>
        <tbody
          v-else-if="items.length"
        >
          <!-- 滚动条宽度问题 -->
          <!-- <colgroup v-if="maxHeight">
          <col
            v-for="column in columns"
            :key="column.name"
            :width="index === columns.length - 1 ? `${parseInt(column.width) - 5}px`: column.width"
          >
        </colgroup> -->
          <row-group-comp
            v-for="(item, idx) in items"
            :key="getItemKey(item)"
            :expand="itemMeta[getItemKey(item) || idx].expand"
          >
            <template slot="content">
              <row-comp
                :appendant="appendant"
                :data="item"
                :topslots="$scopedSlots"
                :data-meta="itemMeta[getItemKey(item) || idx]"
                :item-key="itemKey"
                :columns="columns"
                :column-meta="columnMeta"
              />
            </template>
            <template slot="expand">
              <row-expand-comp
                :columns="columns"
              >
                <slot
                  name="expand"
                  :data="item"
                />
              </row-expand-comp>
            </template>
          </row-group-comp>
        </tbody>


        <tbody v-else>
          <!-- <colgroup v-if="maxHeight">
          <col :width="tableWidth">
        </colgroup> -->
          <tr>
            <td
              :colspan="columns.length"
              style="text-align:center"
            >
              <slot name="noData" />
            </td>
          </tr>
        </tbody>
      </template>
    <!-- </template> -->
    </table>
  </div>
</template>

<script>
import { get } from 'lodash';
import thComp from './th.js';
import rowGroupComp from './row-group.js';
import rowComp from './row.js';
import rowExpandComp from './row-expand.js';

function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
}
const increase = function(n, amount) {
    if (n > 1) {
        return;
    }
    if (typeof amount !== 'number') {
        if (n >= 0 && n < 0.2) { amount = 0.1; } else if (n >= 0.2 && n < 0.5) { amount = 0.04; } else if (n >= 0.5 && n < 0.8) { amount = 0.02; } else if (n >= 0.8 && n < 0.99) { amount = 0.005; } else { amount = 0; }
    }

    n = clamp(n + amount, 0, 0.994);
    return n;

};

export default {
    components: {
        thComp,
        rowGroupComp,
        rowComp,
        rowExpandComp,
    },
    provide() {
        return {
            registEvent: this.registEvent,
            triggerEvent: this.triggerEvent,
        };
    },
    props: {
        columns: Array,
        items: Array,
        itemKey: String,
        maxHeight: String,
        // tableWidth: {
        //     type: String,
        //     default: '1142px',
        // },
        appendant: {
            type: Object,
            default: () => ({}),
        },
        loading: Boolean,
        error: Boolean,
        resizable: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            columnWidth: this.columns.map(c => c.width || 'auto'),
            columnMeta: this.columns.map(() => ({
                __tablemeta__: {},
                order: undefined,
                sort: false,
            })),
            itemMeta: this.initItemMeta(),
            progressMeta: {
                curr: 0,
                opacity: 1,
            },
        };
    },
    computed: {
        progressStyle() {
            if (this.progressMeta.opacity) {
                return {
                    transition: 'all .2s linear',
                    transform: 'translate3d(' + (this.progressMeta.curr - 1) * 100 + '%,0,0)',
                    opacity: this.progressMeta.opacity,
                };
            }
            return {
                transition: 'none',
                transform: 'translate3d(-100%,0,0)',
                opacity: this.progressMeta.opacity,
            };


        },
    },
    watch: {
        // columns() {
        //     this.columnMeta = this.columns.map(() => ({
        //         __tablemeta__: {},
        //     }));
        // },
        columns() {
            this.initColumnWidth();
            this.initColumnMeta();
        },
        items(val, oldval) {
            if (this.itemKey) {
                const newk = val.map(p => get(p, this.itemKey, '')).join('');
                const oldk = oldval.map(p => get(p, this.itemKey, '')).join('');
                if (oldk !== newk) {
                    this.itemMeta = this.initItemMeta();
                }
            } else {
                this.itemMeta = this.initItemMeta();
            }
        },
        loading(val) {
            console.log(val);
            if (val) {
                this.startProgress();
            } else {
                this.doneProgress();
            }
        },
    },
    mounted() {
        // const ths = this.$el.querySelectorAll('thead > tr > th');
        // const w = Array.prototype.map.call(ths, el => {
        //     return getComputedStyle(el).width;
        // });

        // this.columnWidth = w;
        this.resizeState = {
            moving: false,
            curColumn: undefined,
        };
        if (this.loading) {
            this.startProgress();
        }
        this.initColumnWidth();

    },
    methods: {
        initColumnWidth() {
            this.$set(this, 'columnWidth', this.columns.map(c => c.width || 'auto'));
            if (this.resizable) {
                this.$nextTick(() => {
                    const ths = this.$refs.theadtr.querySelectorAll('th');
                    Array.prototype.forEach.call(ths, (element, idx) => {
                        const width = `${element.getBoundingClientRect().width}px`;
                        this.$set(this.columnWidth, idx, width);
                    });
                });
            }
        },
        initColumnMeta() {
            this.$set(this, 'columnMeta', this.columns.map(() => ({
                __tablemeta__: {},
            })));
        },
        initItemMeta() {
            const itemMeta = {};
            this.items.forEach((element, idx) => {
                const key = this.getItemKey(element) || idx;
                itemMeta[key] = {
                    expand: false,
                };
            });
            return itemMeta;
        },
        registEvent(event, datafn, extract = d => d) {
            this.$watch(datafn, val => {
                this.$emit(event, extract(val, this.items));
            });
        },
        triggerEvent(event) {
            this.$emit(event);
        },
        onColumnSort({ order, name }) {
            const index = this.columns.findIndex(c => c.name === name);
            this.columnMeta.forEach((cmeta, idx) => {
                if (idx === index) {
                    cmeta.sort = true;
                    cmeta.order = order;
                } else {
                    cmeta.sort = false;
                }
            });
            this.$emit('sort', {
                order, name,
            });
        },
        startProgress() {
            console.log('startProgress');
            this.progressMeta.opacity = 1;
            this.progressMeta.curr = 0;
            const work = () => {
                setTimeout(() => {
                    if (!this.loading) return;
                    const n = increase(this.progressMeta.curr);
                    this.progressMeta.curr = n;
                }, 200);
            };
            work();

        },
        doneProgress() {
            const n = increase(this.progressMeta.curr, 0.3 + 0.5 * Math.random());
            this.progressMeta.curr = n;
            setTimeout(() => {
                this.progressMeta.curr = 1;
                setTimeout(() => {
                    this.progressMeta.opacity = 0;
                }, 200);
            }, 200);
        },
        getItemKey(item) {
            return get(item, this.itemKey, '');
        },
        onbeginResize(meta) {
            const idx = this.columns.findIndex(c => c.name === meta.column.name);
            this.resizeState = {
                moving: true,
                curColumn: idx,
            };
        },
        onResizing($event) {
            if (this.resizeState.moving) {
                const columnWidth = this.columnWidth;
                const index = this.resizeState.curColumn;
                const movementX = $event.movementX;
                const length = columnWidth.length;
                const th = parseInt(columnWidth[index]);
                this.$set(this.columnWidth, index, th + movementX + 'px');
                const nextIdx = index + 1;
                if (nextIdx < length) {
                    const nextTh = parseInt(columnWidth[nextIdx]);
                    this.$set(this.columnWidth, nextIdx, nextTh - movementX + 'px');
                }
            }

        },
        onEndResize() {
            this.resizeState.moving = false;
        },
    },
};
</script>

<style module>
.scrollable{
    overflow-y: auto;
}
.scrollable .root > thead th {
    position: sticky;
    top: 0;
    z-index: 99;
}
.root{
    table-layout: fixed;
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
    user-select: none;
}

.root > thead th {
    vertical-align: middle;
    box-sizing: border-box;
    padding: 13px 10px 13px 0;
    line-height: 20px;
    text-align: left;
    font-weight: 400;
     background-color: #f5f7fa;
      border-bottom: 1px solid #ebf0f5;
}
.root > thead th:first-child {
    padding-left: 10px;
}
.root > thead th > *:first-child {
    padding-right: 10px;
}
.root > thead tr {
    /* background-color: #f5f7fa; */
    background-clip: padding-box;
    /* border-bottom: 1px solid #ebf0f5; */
}
.root > thead tr.progress{
    background: none;
    border: none;
}
.root > thead tr.progress > th{
    padding: 0;
    height: auto !important;
    position: relative;
}
.progressbar{
    position: absolute;
    height: 2px;
    width: 100%;
    pointer-events: none;
    overflow: hidden;
}
.progressbar > div {
    width: 100%;
    height: 2px;
    left: 0;
    position: absolute;
    top: 0;
    background: $brand-primary;
    transform: translate3d(-100%,0,0);

}
.root > tbody tr {
    border-bottom: 1px solid #ebf0f5;
}
.root > tbody tr:first-child {
    border-top: 1px solid transparent;
}
.root > tbody tr td {
    position: relative;
    vertical-align: middle;
    box-sizing: border-box;
    padding: 13px 10px 13px 0px;
    line-height: 20px;
    width: auto;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #575962;
}
.root > tbody tr td > span {
    display: block;
}
.root > tbody tr td:first-child {
    padding-left: 10px;
}
</style>
