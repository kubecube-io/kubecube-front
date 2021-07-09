<template>
  <div>
    <!-- 字段过滤显示模式 -->
    <div :class="[$style.table, $style.tableScroll]">
      <div :class="[$style.row, $style.thead]">
        <span
          :class="[$style.col, $style.col1]"
          :shrink="!titleSpand"
          :style="`cursor: pointer;${stickyTableTop}`"
          @click="changeTableSort"
        >
          <span v-if="titleSpand">时间<span>{{ tablesort==='asc' ? '↑': '↓' }}</span></span>
        </span>
        <span
          :class="[$style.col, $style.coln]"
          type="message"
          :style="stickyTableTop"
        >
          <span
            :class="$style.shrink"
            :title="titleSpand ? '收起' : '展开'"
            @click="titleSpand = !titleSpand"
          >{{ titleSpand ? '❮': '❯' }}</span>
          message
          <span
            v-if="selectedFileds.length===0"
            :class="[$style.zoom, zoom ? $style.shrink : $style.extend]"
            @click="zoomHandler"
          />
        </span>
        <span
          v-for="(f, idx) in selectedFileds"
          :key="f"
          :class="[$style.col, $style.coln, $style.theaderItem]"
          :type="f"
          :style="stickyTableTop"
        >
          {{ f }}
          <span @click="removeSelectHead(f)">
            <u-icons
              :class="$style.closeIcon"
              name="close"
            />
          </span>
          <span
            v-if="idx===selectedFileds.length-1"
            :class="[$style.zoom, zoom ? $style.shrink : $style.extend]"
            @click="zoomHandler"
          />
        </span>
      </div>
      <template v-if="displayData.length > 0">
        <div
          v-for="d in displayData"

          :key="d.uniqueKey"
          :class="$style.row"
        >
          <span
            :class="[$style.col, $style.col1]"
            :shrink="!titleSpand"
          >
            <span
              v-show="titleSpand"
              v-skeleton="'light'"
              style="display:inline-block;"
              :sk-status="(loading || d.loading) ? 'loading': 'loaded'"
            >
              {{ d.timestamp | smartDateFormat }}
            </span>
            <span :class="$style.hoverChioce">
              <template v-if="$route.meta.type === 'normal'">
                <span :class="$style.menuWrapper">
                  <u-icons
                    name="logmenu"
                    :class="$style.logType"
                    :mode="true"
                  />
                  <div :class="$style.menu">
                    <span
                      v-if="d.mode === 'source'"
                      title="模式切换"
                      @click="d.mode = 'json'"
                    >
                      <u-icons
                        name="logseerlognormal"
                        :class="$style.logType"
                        :mode="true"
                      />
                    </span>
                    <span
                      v-if="d.mode === 'json'"
                      title="模式切换"
                      @click="d.mode = 'source'"
                    >
                      <u-icons
                        name="logseerjson"
                        :class="$style.logType"
                        :mode="true"
                      />
                    </span>
                    <span
                      title="日志上下文"
                      @click="goContext(d)"
                    >
                      <u-icons
                        style="margin-right:0;"
                        name="logseercontext"
                        :class="$style.logType"
                        :mode="true"
                      />
                    </span>
                  </div>
                </span>
              </template>
              <template v-else>
                <span
                  v-if="d.mode === 'source'"
                  @click="d.mode = 'json'"
                >
                  <u-icons
                    name="logseerlognormal"
                    :class="$style.logType"
                    :mode="true"
                  />
                </span>
                <span
                  v-if="d.mode === 'json'"
                  @click="d.mode = 'source'"
                >
                  <u-icons
                    name="logseerjson"
                    :class="$style.logType"
                    :mode="true"
                  />
                </span>
              </template>
            </span>
          </span>
          <!-- <span v-skeleton="'dark'" :key="`${d.timestamp}source`" :sk-status="(loading || d.loading) ? 'loading': 'loaded'" :class="[$style.col, $style.col2]"
                    v-if="(d.mode || mode) === 'source'"
                    v-html="d.message"></span> -->

          <pre
            v-if="d.mode === 'source'"
            :key="`${d.timestamp}source-message`"
            v-skeleton="'dark'"
            v-ellipsis="550"
            :sk-status="(loading || d.loading) ? 'loading': 'loaded'"
            :class="[$style.col, $style.coln, $style.pre]"
            v-html="d.message"
          >
                    <!-- {{ getData(d.raw, 'message') }} -->
                </pre>
          <span
            v-if="d.mode === 'json'"
            :key="`${d.timestamp}json`"
            v-skeleton="'dark'"
            :sk-status="(loading || d.loading) ? 'loading': 'loaded'"
            :class="[$style.col, $style.col2]"
          >
            <vue-json-pretty
              :data="d.raw"
              :show-line="true"
              :deep="3"
            />
          </span>
          <span
            v-for="f in selectedFileds"
            :key="`${d.timestamp}source-${f}`"
            v-skeleton="'dark'"
            :sk-status="(loading || d.loading) ? 'loading': 'loaded'"
            :class="[$style.col, $style.coln]"
          >
            {{ getData(d.raw, f) }}
          </span>
        </div>
      </template>
    </div>
    <div
      v-if="displayData.length === 0"
      :class="$style.nodata"
    >
      <span>暂无相关日志</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import _ from 'lodash';
function getContainerEl(el) {
    let node = el.parentNode;
    while (
        node &&
        node.tagName !== 'HTML' &&
        node.tagName !== 'BODY' &&
        node.nodeType === 1
    ) {
        if (node.hasAttribute('infinite-scroll-container')) {
            return node;
        }
        node = node.parentNode;
    }
    return node;
}
const hour = 60 * 60 * 1000;
export default {
    components: {
        VueJsonPretty,
    },
    inject: [ 'forceToRefresh' ],
    props: {
        zoom: Boolean,
        selectedFileds: Array,
        displayData: Array,
        loading: Boolean,
        mode: String,
        topSticky: Number,
    },
    data() {
        return {
            titleSpand: true,

            // visiableRows: [],
            // findVisiableRowsThrottle: _.throttle(this.findVisiableRows, 200)
        };
    },
    computed: {
        ...mapState({
            tablesort: state => state.lens.tablesort,
            selected: state => state.likesSuggestion.selected,
        }),
        stickyTableTop() {
            // if(this.$route.path === '/lens/normal') return 'top: 156px;';
            // if(this.$route.path === '/lens/stream') return 'top: 124px;';
            return `top: ${this.topSticky}px;`;
        },
        selectedFiledsWithoutMessage() {
            return !this.selectedFileds.includes('message');
        },
    },
    // watch: {
    //     mode(val){
    //         if(val === 'json'){
    //             this.visiableRows = [];
    //             this.$nextTick(() => {
    //                 this.findVisiableRowsThrottle();
    //             })
    //         }
    //     }
    // },
    mounted() {
        const container = getContainerEl(this.$el);
        this.containeElm = container;
        // container.addEventListener('scroll', this.findVisiableRowsThrottle);
    },

    beforeDestroy() {
        // this.containeElm.removeEventListener('scroll', this.findVisiableRowsThrottle);
    },
    methods: {
        ...mapActions('likesSuggestion', [
            'removeSelected',
        ]),
        getData(t, f) {
            return _.get(t, f, '-');
        },
        changeTableSort() {
            if (!this.titleSpand) return;
            this.$store.commit('lens/setTableSort', this.tablesort === 'asc' ? 'desc' : 'asc');
            this.forceToRefresh();
        },
        // findVisiableRows(e){
        //     if(!this.$refs.table) return;
        //     const elm = this.containeElm;
        //     const height = window.innerHeight;
        //     const visiableRows = [];
        //     Array.prototype.forEach.call(this.$refs.table.children, (ele, idx) => {
        //         const top = ele.getBoundingClientRect().top;
        //         if(top > 0 && top < height && !visiableRows.includes(idx)) {
        //             visiableRows.push(idx)
        //         }
        //     });

        //     this.visiableRows = this.visiableRows.concat(visiableRows);
        // },
        removeSelectHead(f) {
            this.removeSelected(f);
            this.$emit('onTheadChange');
        },
        zoomHandler() {
            this.$emit('zoom');
        },
        goContext(hit) {
            console.log(hit.timestamp);
            const fromTime = hit.timestamp;
            const startTime = fromTime - hour * 12;
            const endTime = fromTime + hour * 12;
            this.$store.dispatch('logcontext/openContext', {
                startTime,
                endTime,
                fromTime,
                id: hit.id,
            });
        },
    },

};
</script>

<style module>
.menuWrapper{
    position: relative;
}
.menuWrapper:hover > .menu {
    display: block;
}
.menu{
    transform: translate(-50%, -20%);
    display: none;
    position: absolute;
    background: #fff;
    width: 62px;
    padding: 3px 8px;
    z-index: 98;
    box-shadow: 0 0 5px rgba(0,0,0,0.1);
}
.table{
    width: 100%;
    min-width: 100%;
    display: table;
    table-layout: fixed;
    border-collapse: separate;
}
.table.tableScroll{
    width: 100%;
    position: relative;
}
.shrink{
    cursor: pointer;
}
.shrink:hover{
    color:rgb(255, 222, 139);
}
.row{
    padding: 10px;
    display: table-row;
    position: relative;
}
.row em{
    background: yellow;
}
.row:hover{
    background-color: rgb(255, 244, 239);
}
.row:hover .col1{
    background-color: rgb(255, 244, 239);
    border-right-color:rgb(255, 222, 139);
}
.hoverChioce{
    top: 0;
    right: 0;
    display: none;
    position: absolute;
}
.row:hover .hoverChioce{
    display: block;
}
.thead{
    position: relative;
    background-color: #f5f7fa;
    background-clip: padding-box;
    border-bottom: 1px solid #ebf0f5;
}
.thead .col{
    background-color: #f5f7fa;
    position: sticky;
    top: 156px;
    padding: 16px;
    z-index: 9;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none; /* Standard */
}
.col{
    padding: 2px 16px;
    font-size: 14px;
    line-height: 1.5;
    font-family: "Roboto Mono", Consolas, Menlo, Courier, monospace;
    color: rgb(52, 55, 65);
    display: table-cell;
    word-break: break-all;
    vertical-align: top;

}
.col1{
    border-right: 2px solid rgb(211, 218, 230);
    color: rgb(105, 112, 125);
    background-color: rgb(245, 247, 250);
    width: 220px;
    min-width: 220px;
    position: relative;
}
.tableScroll .col1[shrink="true"]{
    width: 10px;
}

.tableScroll .col1 {
    text-align: left;
    width: 220px;
    /* min-width: 220px; */
}
.pre{
    white-space: pre-wrap;
    word-wrap: break-word;
}
.col2{
    width: 80%;
}

.coln{
    width: 10%;
}
.coln[type='message']{
    width: auto;
}
.coln[nomessage='true']{
    width: auto;
}
.logType[mode="true"]{
    color: #575962;
}
.logType{
    color: #eee;
    cursor: pointer;
}
.nodata{
    text-align: center;
}
.theaderItem:hover .closeIcon{
    visibility: visible;
}
.closeIcon{
    cursor: pointer;
    display: inline-block;
    visibility: hidden;
    /* position: absolute; */
    font-size: 12px;
}
.zoom{
    position: absolute;
    right: 0;
    top: 0px;
    width: 30px;
    height: 30px;
    z-index: 10;
    text-align: center;
    cursor: pointer;
}
.zoom.extend::before{
    icon-font: url(@micro-app/common/icons/svg/apm-extend.svg);
}
.zoom.shrink::before{
    icon-font: url(@micro-app/common/icons/svg/apm-small.svg);
}
</style>
