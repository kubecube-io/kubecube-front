<template>
  <div :class="$style.root">
    <div v-if="loading" :class="$style.loadingBox"><div :class="$style.loadingTextWrap"><i class="el-icon-loading" style="font-size: 24px"/> 正在加载数据</div></div>
    <!-- <button
      :class="$style.pageBtn"
      @click="scrollTo(-5)"
    >
      向上翻页
    </button> -->
    <table :class="[$style.table, $style.tableScroll]" :theme="theme">
      <thead :class="[$style.row, $style.thead]">
        <tr :class="$style.row">
          <th :class="[$style.col, $style.col1]">
            时间
          </th>
          <th
            :class="[$style.col, $style.coln]"
            type="message"
          >
            日志内容
          </th>
        </tr>
      </thead>
      <tbody
        ref="tbody"
        :class="$style.tbody"
      >
        <tr
          :class="$style.row"
          style="height: 25px"
        >
          <td :class="[$style.col, $style.col1]">
          </td>
          <td :class="[$style.col, $style.coln, $style.logContent]" style="text-align: center">
            {{ hasMoreOld ?  '' : '暂无更多历史日志' }}
          </td>
        </tr>
        <template v-if="data.length > 0">
          <tr
            v-for="d in data"

            :id="d.timestamp"
            :key="d.timestamp"
            :class="$style.row"
          >
            <td :class="[$style.col, $style.col1]">
              {{ d.timestamp | formatLocaleTime }}
            </td>
            <td :class="[$style.col, $style.coln, $style.logContent]">{{ d.content }}</td>
          </tr>
        </template>
        <template v-else>
          <tr :class="$style.row">
            <td :class="[$style.col, $style.col1]"></td>
            <td
              style="text-align: center"
            >
              暂无日志
            </td>
          </tr>
        </template>
        <tr
          :class="$style.row"
          style="height: 25px"
        >
          <td :class="[$style.col, $style.col1]"></td>
          <td :class="[$style.col, $style.coln, $style.logContent]"></td>
        </tr>
      </tbody>
    </table>
    <!-- <button
      :class="$style.pageBtn"
      @click="scrollTo(5)"
    >
      向下翻页
    </button> -->
  </div>
</template>

<script>
import { unionBy, get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';

// function animate(callback, duration) {
//     let start;
//     const step = timestamp => {
//         if (start === undefined) { start = timestamp; }
//         const elapsed = timestamp - start;
//         callback(elapsed);
//         if (elapsed < duration) { // Stop the animation after 2 seconds
//             window.requestAnimationFrame(step);
//         }
//     };
//     window.requestAnimationFrame(step);
// }

// const displayDataStep = 50;
const loadStep = 100;
export default {
    props: {
        podName: String,
        containerName: String,
        autoRefresh: Boolean,
        theme: String,
    },
    data() {
        return {

            data: [],
            offsetFrom: 2000000,
            offsetTo: 200100,
            currentId: null,
            selection: {
                referenceLineNum: 0,
                logFilePosition: 'end',
                referenceTimestamp: 'newest',
            },
            limit: 30,
            hasMoreOld: true,
            loading: true,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        logParams() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    pod: this.podName,
                },
                params: {
                    containerName: this.containerName,
                    offsetFrom: this.offsetFrom,
                    offsetTo: this.offsetTo,
                    ...this.selection,
                },
            };
        },
    },
    watch: {
        autoRefresh(val) {
            if(val) {
                this.handleAutoRefresh();
            } else {
              if (this.autoRefreshTimer) {
                  clearTimeout(this.autoRefreshTimer);
                  this.autoRefreshTimer = null;
              }
            }
        }
    },
    created() {
        this.reInit();
    },
    mounted() {
        this.$watch(() => [ this.podName, this.containerName ], this.reInit);
    },
    destroyed() {
        clearTimeout(this.autoRefreshTimer);
    },
    methods: {
        async handleAutoRefresh() {
            this.removeScrollBehaviour();
            this.scrollToBottom();
            this.selection = {
                referenceLineNum: 0,
                logFilePosition: 'end',
                referenceTimestamp: 'newest',
            };
            this.limit = this.limit < 30 ? 30 : this.limit;
            this.offsetFrom = 200000;
            this.offsetTo = this.offsetFrom + this.limit;
            const logs = await this.invokeBeforeAPI();
            if (this.limit > logs.length) {
                this.hasMoreOld = false;
            } else {
                this.hasMoreOld = true;
            }
            this.limit = logs.length;
            this.scrollToBottom();
            this.loading = true;
            await this.delayFun(1000);
            this.loading = false;
            this.bindScrollBehaviour();
            if (this.autoRefreshTimer) {
                clearTimeout(this.autoRefreshTimer);
                this.autoRefreshTimer = null;
            }
            this.autoRefreshTimer = setTimeout(() => {
                if(this.autoRefresh) {
                  this.handleAutoRefresh();
                }
            }, 3000)
        },
        async reInit() {
            this.$emit('update:autoRefresh', false)
            console.log('xxxxxxxxxxxxxxx');
            this.hasMoreOld = true;
            this.data = [];
            this.offsetFrom = 200000;
            this.limit = 30;
            this.offsetTo = this.offsetFrom + this.limit;
            const elem = this.$refs.tbody;
            // elem.removeEventListener('scroll', this.scrollHandler);
            this.selection = {
                referenceLineNum: 0,
                logFilePosition: 'end',
                referenceTimestamp: 'newest',
            };
            // this.invokeBeforeAPI();
            this.removeScrollBehaviour();
            const logs = await this.invokeBeforeAPI();
            if (this.limit > logs.length) {
                this.hasMoreOld = false;
            } else {
                this.hasMoreOld = true;
            }
            this.limit = logs.length;
            this.$nextTick(() => {
                this.scrollToBottom();
                this.bindScrollBehaviour();
            });
        },
        bindScrollBehaviour() {
            const elem = this.$refs.tbody;
            elem.addEventListener('scroll', this.scrollHandler);
        },
        removeScrollBehaviour() {
            const elem = this.$refs.tbody;
            if (elem) {
              elem.removeEventListener('scroll', this.scrollHandler);
            }
        },
        scrollHandler() {
            this.$emit('update:autoRefresh', false)
            const elem = this.$refs.tbody;
            if (elem.scrollTop <= 1) {
                this.loadOldLog();
            } else if(elem.scrollTop + 1 >= elem.scrollHeight - elem.clientHeight) {
                this.loadNewLog();
            }
        },
        scrollToTop() {
            const elem = this.$refs.tbody;
            elem.scrollTop = 25;
        },
        scrollToBottom() {
            const elem = this.$refs.tbody;
            elem.scrollTop = elem.scrollHeight - elem.clientHeight - 25;
        },
        async loadOldLog() {
            if(!this.hasMoreOld) {
              return;
            }
            this.removeScrollBehaviour();
            this.limit += 20;
            this.offsetFrom = this.offsetTo - this.limit;
            const logs = await this.invokeBeforeAPI();
            if (this.limit > logs.length) {
                this.hasMoreOld = false;
            } else {
                this.hasMoreOld = true;
            }
            this.limit = logs.length;
            this.scrollToTop();
            this.bindScrollBehaviour();
        },
        async loadNewLog() {
          this.removeScrollBehaviour();
          // this.limit += 20;
          this.limit = this.limit < 30 ? 30 : this.limit;
          this.offsetFrom = 200000;
          this.offsetTo = this.offsetFrom + this.limit;
          this.selection = {
              referenceLineNum: 0,
              logFilePosition: 'end',
              referenceTimestamp: 'newest',
          };
          const logs = await this.invokeBeforeAPI();
          if (this.limit > logs.length) {
              this.hasMoreOld = false;
          } else {
              this.hasMoreOld = true;
          }
          this.limit = logs.length;
          this.scrollToBottom();
          this.bindScrollBehaviour();
        },
        async invokeBeforeAPI() {
            this.loading = true;
            const { logs, selection } = await workloadExtendService.getlog(this.logParams);
            this.data = logs;
            await this.delayFun(1000);
            this.loading = false;
            this.offsetFrom = selection.offsetFrom;
            this.offsetTo = selection.offsetTo;
            Object.assign(this.selection, {
                referenceLineNum: selection.referencePoint.lineNum,
                logFilePosition: selection.logFilePosition,
                referenceTimestamp: selection.referencePoint.timestamp,
            });
            return logs;
        },
        scrollTo() {

        },
        async delayFun(val = 1000) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, val)
          })
        },
    },

};
</script>

<style module>
.root{
    height: 100%;
    position: relative;
}
.loadingBox{
  background: rgba(0, 0, 0, .3);
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loadingBox .loadingTextWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.table{
    width: 100%;
    /* margin: 10px 0; */
    min-width: 100%;
    display: table;
    table-layout: fixed;
    border-collapse: collapse;
}
.table[theme="dark"] > .thead .col {
  background-color: #2B2631;
}
.table[theme="dark"] {
  background-color: #000000;
}
.table[theme="dark"] .col {
  color: #ffffff;
}
.table.tableScroll{
    width: 100%;
    position: relative;
}
.table > .thead .col{
    background-color: #f5f7fa;
    padding: 16px;
}
.tableScroll > .thead,
.tableScroll > .tbody{
    display: block;
    width: calc(100% + 5px);

    overflow-y: scroll;
    overflow-x: hidden;
}
.tableScroll > .tbody{
    height: calc(100vh - 320px);
    width: 100%;
}
.tableScroll > .thead > .row,
.tableScroll > .tbody > .row{
    display: table;
    table-layout: fixed;
    width: 100%;
}
.tableScroll > .tbody .row[focus],
.tableScroll > .tbody .row[focus]:hover,
.tableScroll > .tbody .row[focus]:hover .col1 {
    background-color: yellowgreen;
}
.logContent {
  white-space: pre-wrap;
}
.col {
    padding: 2px 16px;
    font-size: 14px;
    line-height: 1.5;
    font-family: "Roboto Mono", Consolas, Menlo, Courier, monospace;
    color: rgb(52, 55, 65);
    word-break: break-all;
    vertical-align: top;
}
.pageBtn{
    border: none;
    background-color: rgb(211, 218, 230);
    padding: 8px 16px;
    color: rgb(52, 55, 65);
    width: 100%;
    cursor: pointer;
}
.col1 {
    border-right: 2px solid rgb(211, 218, 230);
    width: 240px;
    text-align: center;
}
.coln{
    width: auto;
}
.shrink{
    cursor: pointer;
}
.shrink:hover{
    color:rgb(255, 222, 139);
}
.row{
    position: relative;
}
.row em{
    background: yellow;
}
.tableScroll > .tbody .row:hover{
    background-color: rgb(255, 244, 239);
}
.tableScroll > .tbody .row:hover .col1{
    background-color: rgb(255, 244, 239);
    border-right-color:rgb(255, 222, 139);
}
.tableScroll > .tbody .row:hover .col{
    color: rgb(52, 55, 65);
}
</style>
