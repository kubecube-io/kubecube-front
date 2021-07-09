<template>
  <div :class="$style.root">
    <!-- <button
      :class="$style.pageBtn"
      @click="scrollTo(-5)"
    >
      向上翻页
    </button> -->
    <table :class="[$style.table, $style.tableScroll]">
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
            <td :class="[$style.col, $style.coln]">
              {{ d.content }}
            </td>
          </tr>
        </template>
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
    },
    data() {
        return {

            data: [],
            offsetFrom: 2000100,
            // offsetTo: 200000
            drainBefore: false,
            currentId: null,
            selection: {
                referenceLineNum: 0,
                logFilePosition: 'end',
                referenceTimestamp: 'newest',
            },
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
                    offsetFrom: this.offsetFrom - loadStep,
                    offsetTo: this.offsetFrom,
                    ...this.selection,
                },
            };
        },
    },
    created() {
        this.invokeBeforeAPI();
    },
    mounted() {
        this.$watch(() => [ this.podName, this.containerName ], this.reInit);
    },
    methods: {
        reInit() {
            console.log('xxxxxxxxxxxxxxx');
            this.data = [];
            this.offsetFrom = 2000100;
            this.drainBefore = false;
            const elem = this.$refs.tbody;
            elem.removeEventListener('scroll', this.scrollHandler);
            this.invokeBeforeAPI(true);
        },
        bindScrollBehaviour() {
            const elem = this.$refs.tbody;
            elem.addEventListener('scroll', this.scrollHandler);
        },
        scrollHandler() {
            const elem = this.$refs.tbody;
            if (elem.scrollTop <= 0) {
                this.invokeBeforeAPI();
            }
        },
        async invokeBeforeAPI() {
            if (this.drainBefore) {
                return;
            }

            const { logs, selection } = await workloadExtendService.getlog(this.logParams);
            const currentId = getFunc(logs[logs.length - 1], 'timestamp');
            const hits = unionBy(
                logs,
                this.data,
                'timestamp'
            );
            this.data = hits;
            this.offsetFrom = selection.offsetFrom;
            this.offsetTo = selection.offsetTo;
            this.drainBefore = selection.offsetFrom < 0;
            Object.assign(this.selection, {
                referenceLineNum: selection.referencePoint.lineNum,
                logFilePosition: selection.logFilePosition,
                referenceTimestamp: selection.referencePoint.timestamp,
            });

            if (currentId) {
                this.$nextTick(() => {
                    document.getElementById(currentId).scrollIntoView();
                    this.bindScrollBehaviour();
                });
            }
        },
        scrollTo() {

        },
    },

};
</script>

<style module>
.root{
    height: 100%;
}
.table{
    width: 100%;
    /* margin: 10px 0; */
    min-width: 100%;
    display: table;
    table-layout: fixed;
    border-collapse: collapse;
}
.table.tableScroll{
    width: 100%;
    position: relative;
}
.table > .thead .col{
    background-color: #f5f7fa;
    padding: 16px;
}
.table > .thead .coln{
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
</style>
