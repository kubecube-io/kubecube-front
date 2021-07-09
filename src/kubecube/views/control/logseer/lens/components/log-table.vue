<template>
  <div
    :class="[$style.root, zoom ? $style.fullscreen: {}]"
    :infinite-scroll-container="zoom"
    :stream-scroll-container="zoom"
  >
    <div
      v-if="!zoom"
      ref="staticElm"
      v-sticky
      :class="$style.head"
      on-stick="onStick"
    >
      <div :class="$style.lpart">
        <!-- <span :class="$style.logType">
                    <u-icons name="logseerlognormal"></u-icons>
                    <u-text>原始日志</u-text>
                </span> -->
      </div>
      <div :class="$style.rpart">
        <!-- <likes-transport :incharge="selectedFileds.length > 0" :popperHeight="popperHeight" @confirmchange="onConfirmChange"></likes-transport> -->
        <!-- <u-icons name="repo"></u-icons> -->

        <!-- <span @click="changeMODE('json')" style="margin-left: 10px" :class="$style.logType" :mode="mode === 'json'">
                    <u-icons name="logseerjson"></u-icons>
                    <u-text>JSON格式</u-text>
                </span> -->
        <!-- <span @click="openLikes" :class="$style.logType" :mode="selectedFileds.length > 0 || showLikesPopper"> -->
        <!-- <span
          v-if="lenMode !== '/lens/stream'"
          :class="$style.logType"
          @click="$refs.downloadmodal.open()"
        >
          <u-icons name="exportlog" />
          <u-text>导出日志</u-text>
        </span> -->
        <span
          :class="$style.logType"
          :mode="showMode === 'source'"
          @click="changeShowMode('source')"
        >
          <u-icons name="logseerlognormal" />
          <u-text>原始日志</u-text>
        </span>
        <span
          :class="$style.logType"
          :mode="showMode === 'likes'"
          @click="changeShowMode('likes')"
        >
          <likes-transport @confirmchange="onConfirmChange" />
        </span>
      </div>
    </div>

    <infinite-scroll
      v-if="lenMode !== 'stream'"
      ref="infiniteScroll"
      :class="$style.tableWrapper"
      :total="total"
      :step="step"
      :lazy-rows="lazyRows"
      :normalize-data="formatData"
      :get-default-data="getDefaultData"
      :loadmore-fn="loadmoreFn"
    >
      <template slot-scope="{ displayData }">
        <log-display-table
          :zoom="zoom"
          :mode="mode"
          :selected-fileds="selectedFileds"
          :display-data="displayData"
          :loading="loading"
          :top-sticky="topSticky"
          @onTheadChange="onConfirmChange"
          @zoom="onZoom"
        />
      </template>
    </infinite-scroll>
    <stream-scroll
      v-if="lenMode === 'stream'"
      ref="infiniteScroll"
      :frequent="frequent"
      :loadmore-fn="loadmoreStream"
      :normalize-data="formatData"
    >
      <template slot-scope="{ displayData }">
        <log-display-table
          :zoom="zoom"
          :mode="mode"
          :top-sticky="topSticky"
          :selected-fileds="selectedFileds"
          :display-data="displayData"
          :loading="loading"
          @onTheadChange="onConfirmChange"
          @zoom="onZoom"
        />
      </template>
    </stream-scroll>
    <download-modal
      ref="downloadmodal"
      :total="total"
      :body-builder="bodyBuilder"
    />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
// import 'brace/theme/pastel_on_dark';
// import 'brace/mode/json';
import infiniteScroll from './infinite-scroll.vue';
import streamScroll from './stream-scroll.vue';
import likesTransport from './likes-transport.vue';
import logDisplayTable from './log-display-table.vue';
import downloadModal from './download-modal.vue';
import { cloneDeep } from 'lodash';
// const xAceEditorOption = {
//     setUseWrapMode(true);
// }
function getRandomLengthString(min, max) {
    return 's'.repeat(min + (Math.floor(Math.random() * (max - min))));
}
export default {
    components: {
        infiniteScroll,
        streamScroll,
        likesTransport,
        logDisplayTable,
        downloadModal,
    },
    props: {
        area: Object,
        loading: Boolean,
        package: Number,
        total: Number,
        step: Number,
        loadmoreFn: Function,
        loadmoreStream: Function,
        frequent: Number,
        refElement: HTMLDivElement,
        refElementSticky: Boolean,
        bodyBuilder: Function,
    },
    data() {
        return {
            showMode: 'source',
            mode: 'source',
            aceOption: {
                showGutter: false,
                maxLines: 20,
                showPrintMargin: false,
            },
            selectedFileds: [],
            lazyRows: 10,
            topSticky: 0,
            popperHeight: 300,
            zoom: false,
            showDownload: false,
        };
    },
    computed: {
        ...mapState({
            highlightQuery: state => state.lens.query,
            likesSuggestionSelected: state => state.likesSuggestion.selected,
            tablesort: state => state.lens.tablesort,
            showLikesPopper: state => state.likesSuggestion.showLikesPopper,
        }),
        lenMode() {
            return this.$route.params.type;
        },
    },
    watch: {
        mode(val) {
            if (val === 'json') {
                this.lazyRows = 5;
            } else {
                this.lazyRows = 10;
            }
        },
        '$route.query': function() {
            setTimeout(() => {
                this.setOffset();
            }, 250);
        },
        refElementSticky(val) {
            if (val) {
                this.setOffset();
            }
        },
        showLikesPopper(val) {
            if (val) { this.onConfirmChange(); }
        },
    },
    methods: {
        ...mapMutations('likesSuggestion', [ 'SET_SHOW_LIKES_POPPER' ]),
        setOffset() {

            const { height } = this.refElement.getBoundingClientRect();
            const offsettop = height + 63;
            this.$refs.staticElm['@@vue-sticky-directive'].options.topOffset = offsettop;
            this.topSticky = height + 29;
            this.popperHeight = window.innerHeight - offsettop - 35;
            console.log('setOffset', this.topSticky);
        },
        getOffset() {
            // console.log(this.refElement.getBoundingClientRect())
            return this.$route.path === '/lens/normal' ? 189 : 141;
        },
        refresh() {
            if (this.$refs.infiniteScroll && this.$refs.infiniteScroll.refresh) this.$refs.infiniteScroll.refresh();
        },
        getDefaultData() {
            return {
                timestamp: +new Date(),
                message: getRandomLengthString(120, 320),
                loading: true,
                mode: undefined,
            };
        },
        onLoadmore(offset) {
            this.$emit('loadmore', offset);
        },
        formatData({ _source, highlight, _id }) {
            const timestamp = +new Date(_source['@timestamp']);
            return {
                timestamp,
                message: highlight ? highlight.message.join('') : _source.message,
                raw: _source,
                id: _id,
                mode: 'source',
            };
        },
        renderMessage(message) {
            if (this.highlightQuery && this.highlightQuery.trim()) {
                try {
                    message = '<span>' + message.replace(new RegExp(`(${this.highlightQuery})`, 'g'), '<em>$1</em>') + '</span>';
                } catch (err) {
                    console.log(err);
                }
            }
            return message;

        },
        changeShowMode(mode) {
            if (mode === 'source') {
                this.selectedFileds = [];
            }
            if (mode === 'likes') {
                this.selectedFileds = cloneDeep(this.likesSuggestionSelected);
            }
            this.showMode = mode;
        },
        // changeMODE(mode){
        //     // this.mode = mode;
        //     this.selectedFileds = []
        // },
        // openLikes(){
        //     this.SET_SHOW_LIKES_POPPER(!this.showLikesPopper)
        //     if(this.showLikesPopper)
        //         this.onConfirmChange()
        // },
        onConfirmChange() {
            this.selectedFileds = cloneDeep(this.likesSuggestionSelected);
        },
        onZoom() {
            this.zoom = !this.zoom;
            this.$nextTick(() => {
                this.$refs.infiniteScroll.reload();
                if (this.zoom) {
                    this.topSticky = 0;
                } else {
                    this.setOffset();
                }
            });
        },
    },

};
</script>

<style module>
.fullscreen{
    position: fixed;
    width: 100vw;
    height: 100vh;
    overflow: scroll;
    left: 0;
    top: 0;
    background: #fff;
    z-index: 999;
}
.root{
    /* border: 1px solid #ebf0f5;
    padding: 10px 20px; */
}
.head{
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    /* justify-content: flex-end; */
    justify-content: space-between;
}
.tableWrapper{
    width: 100%;
    /* overflow-y: scroll; */
}
.table{
    width: 100%;
    min-width: 100%;
    display: table;
    table-layout: fixed;
    border-collapse: separate;
}
.fakeTH{
    position: fixed;
    display: none;
    z-index: 999;
}
.fakeTH > span {
    display: inline-block;
}
.table.tableScroll{
    width: 100%;
    position: relative;
}
.row{
    padding: 10px;
    display: table-row;
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
    display: none;
    position: absolute;
}
.row:hover .hoverChioce{
    display: block;
}
.thead{
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
    width: 20%;
}

.tableScroll .col1 {
    text-align: left;
    width: 200px;
    min-width: 200px;
}

.col2{
    width: 80%;
}

.coln{
    width: auto;
    min-width: 200px;
}
.coln[type='message']{
    width: 60%;
}
.logType + .logType {
    border-left: 2px solid #575962;
}
.logType[mode="true"]{
    color: #508ae2;
    /* display: inline-block; */
}
.logType{
    color: #575962;
    cursor: pointer;
    padding: 0 10px;
    position: relative
}
.nodata{
    text-align: center;
}

</style>
