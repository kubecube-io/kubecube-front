<template>
  <div>
    <u-linear-layout style="margin-bottom: 10px">
      <u-text>{{ title }}</u-text>
    </u-linear-layout>
    <u-tabs
      router
      @select="selectMode($event.value)"
    >
      <u-tab
        v-for="(item, index) in tabs"
        :key="index"
        :value="item"
        :title="item.title"
        :to="item.route"
      />
    </u-tabs>

    <u-linear-layout
      direction="horizontal"
      type="flex"
      alignment="center"
      justify="space-between"
    >
      <u-linear-layout
        direction="horizontal"
        gap="small"
      />
    </u-linear-layout>


    <div
      ref="staticElm"
      v-sticky
      on-stick="onStick"
      sticky-z-index="11"
    >
      <u-linear-layout
        direction="vertical"
        :class="$style.searchHead"
        gap="small"
        :sticky="isSticky"
      >
        <u-linear-layout
          direction="horizontal"
          type="flex"
          alignment="center"
          style="margin-bottom: 20px;"
          gap="small"
        >
          <u-filter-task v-if="type !== 'trace'" />
          <u-filter-query
            v-if="type !== 'trace'"
            style="flex: 1"
          />
          <u-filter-trace-query
            v-if="type === 'trace'"
            style="flex: 1"
          />
          <kube-timer
            v-if="type !== 'stream'"
            style="position: relative;width: 480px;"
          />
          <template v-if="type === 'stream'">
            <u-text>刷新频率</u-text>
            <u-number-input
              v-model="frequent"
              :min="1"
            />
            <u-text>秒/次</u-text>
          </template>

          <u-button
            icon="refresh"
            square
            :title="refresh?'点击按钮，开始日志查询':'点击按钮，刷新日志'"
            @click="search(false)"
          />
        </u-linear-layout>
        <u-linear-layout
          v-if="type !== 'trace'"
          style="margin-bottom: 20px;"
          gap="small"
        >
          <u-filter-list @reflow="onReflow" />
        </u-linear-layout>
      </u-linear-layout>
    </div>
    <u-histgram-echarts
      v-if="type === 'normal'"
      ref="chart"
      :data="data"
      @selected="areaSelected"
    />
    <u-log-table
      ref="table"
      :ref-element="$refs.staticElm"
      :ref-element-sticky="isSticky"
      :loadmore-fn="loadmore"
      :loading="loading"
      :total="total"
      :step="step"
      :body-builder="bodyBuilder"
      :loadmore-stream="loadmoreStream"
      :frequent="frequent"
    />
  </div>
</template>

<script>
import Sticky from 'vue-sticky-directive';
import { get } from 'vuex-pathify';
import { mapState, mapGetters } from 'vuex';
import NProgress from 'nprogress';
import logseerService from 'kubecube/services/logseer';
import filterList from './components/filter-list.vue';
import logTable from './components/log-table.vue';
import filterTask from './components/filter-task.vue';
import filterQuery from './components/filter-query.vue';
import filterTraceQuery from './components/filter-trace-query.vue';
import histgram from './components/histgram-echarts.vue';
import { buildfilter } from './components/filter-utils';

function transQuery(cnt) {
    return cnt.replace(/"/g, '\\"');
}
export default {
    metaInfo: {
        title: 'kubecube',
        titleTemplate: '日志查询 - %s',
    },
    components: {
        // ...selectComponents('u-global-cluster-select',
        //     'u-global-namespace-select',
        //     'u-global-container-type-select',
        //     'u-icons-logseer'),
        'u-filter-list': filterList,
        'u-log-table': logTable,
        'u-filter-task': filterTask,
        'u-filter-query': filterQuery,
        'u-filter-trace-query': filterTraceQuery,
        'u-histgram-echarts': histgram,
    },
    directives: { Sticky },
    provide() {
        return {
            forceToRefresh: this.forceToRefresh,
        };
    },
    data() {
        return {
            loading: false,
            // logs: [],
            data: null,
            offset: 0,
            isSticky: false,
            total: 0,
            step: 50,
            frequent: 5,

            tab: {},
            tabs: [
                { title: '搜索模式', route: { path: '/control/lens/normal' } },
                { title: '实时流模式', route: { path: '/control/lens/stream' } },
                // { title: '全链路检索模式', route: { path: '/control/lens/trace' } },
            ],


            refresh: false,
        };
    },
    computed: {
        clusterName: get('scope/cluster@value'),
        clusterId: get('scope/cluster@clusterId'),
        namespace: get('scope/namespace@value'),
        ...mapState({
            filterQuery: state => state.lens.query,
            startTime: state => state.timer.startTime,
            endTime: state => state.timer.endTime,
            task: state => state.lens.task,
            interval: state => state.timer.interval,
            tablesort: state => state.lens.tablesort,
            kind: state => state.lens.kind,
        }),
        ...mapGetters('lens', {
            enabledFilters: 'enabledFilters',
        }),
        type() {
            return this.$route.params.type;
        },
        title() {
            switch (this.$route.path) {
                case '/lens/normal':
                    return '搜索模式';
                case '/lens/stream':
                    return '实时流模式';
                case '/lens/trace':
                    return '全链路检索模式';
                default:
                    return '';
            }
        },
    },
    watch: {
        kind() {
            this.$store.dispatch('likesSuggestion/refreshSuggestions');
        },
        '$route.meta.type': function(val) {
            this.type = val;
        },
        filterQuery() {
            this.refresh = true;
        },
    },
    mounted() {
        // this.$refs.table && this.$refs.table.refresh();
        this.$refs.staticElm['@@vue-sticky-directive'].options.topOffset = 64;
        this.$store.dispatch('likesSuggestion/refreshSuggestions');
    },
    methods: {
        forceToRefresh() {
            this.clear();
            this.$refs.table && this.$refs.table.refresh();

        },
        onKindChange($event) {
            this.$store.commit('lens/setKind', $event.value);
            this.forceToRefresh();
        },
        onReflow() {
            this.$refs.table.setOffset();
            this.$refs.staticElm['@@vue-sticky-directive'].containerEl.scrollBy(0, 1);
        },
        onStick({ sticked }) {
            this.isSticky = sticked;
        },
        clear() {
            this.offset = 0;
        },
        selectMode() {
            this.clear();
            this.$nextTick(() => {
                this.$store.dispatch('timer/setToDefault');
                this.$store.dispatch('lens/setToDefault');
                this.forceToRefresh();
            });
        },
        bodyBuilder() {
            let {
                startTime, endTime, filterQuery: query, task, interval, tablesort,
            } = this;
            console.log(this.startTime, this.endTime);
            const filters = this.enabledFilters;
            if (!startTime || !endTime || !interval) {
                NProgress.done();
                return Promise.resolve({
                    hits: [],
                    total: 0,
                });
            }
            if (this.type === 'trace' && !query) {
                // trace默认一开始不查询
                NProgress.done();
                return Promise.resolve({
                    hits: [],
                    total: 0,
                });
            }
            if (this.type === 'trace') {
                // trace query加引号
                if (!/^".*"$/.test(query)) {
                    query = `"${query}"`;
                }
            }
            const body = {
                size: this.step,
                from: this.offset,
                range: {
                    timestamp: {
                        gte: startTime,
                        lte: endTime,
                    },
                },
                query: transQuery(query || ''),
                aggs: {
                    interval,
                },
                filters: [
                    ...filters,
                    ...(this.type === 'trace' || this.isHost ? [] : buildfilter(this.clusterName, this.namespace, this.isNode)),
                    ...this.isHost ? [{
                        key: 'logtype',
                        operator: 'is',
                        value: 'logfile',
                    }] : [],
                ],
                sort: {
                    timestamp: tablesort,
                },
            };

            if (task && task !== 'all') {
                body.filters.push({
                    key: 'logconfig',
                    operator: 'is',
                    value: task,
                });
            }
            return body;
        },
        invokeSearchAPI(append) {
            NProgress.start();
            const body = this.bodyBuilder();
            if (body instanceof Promise) return body;
            if (!append) this.loading = true;
            console.log(logseerService);
            return logseerService.elasticSearch({
                params: {
                    desensitize: false,
                },
                data: body,
            }).then(data => {
                this.data = data;
                // this.$refs.table && this.$refs.table.refresh()
                this.total = data.hits.total;

                this.loading = false;
                NProgress.done();
                return {
                    hits: data.hits.hits,
                    total: data.hits.total,
                };
            }).catch(err => {
                console.log(err);
                NProgress.done();
            });
        },
        search() {
            if (!this.refresh) {
                this.clear();
                this.$refs.table && this.$refs.table.refresh();
            } else {
                this.refresh = false;
                this.forceToRefresh();
            }
        },
        areaSelected(area) {
            if (!area) return;
            const {
                start, end, interval,
            } = area;
            this.$store.commit('timer/setInterval', interval);
            this.$store.dispatch('timer/setTimeRange', {
                startTime: start,
                endTime: end,
            });
            this.forceToRefresh();
        },
        loadmore(offset) {
            // console.log(offset);
            // if(this.offset != offset){
            //     this.offset = offset;
            this.offset = offset;
            return this.invokeSearchAPI(true);
            // }
            // return Promise.reject();
        },
        loadmoreStream(startTime, endTime) {
            NProgress.start();
            const {
                filterQuery: query, task, interval,
            } = this;
            const filters = this.enabledFilters;
            const body = {
                size: 999,
                from: 0,
                range: {
                    timestamp: {
                        gte: startTime,
                        lte: endTime,
                    },
                },
                query: transQuery(query || ''),
                aggs: {
                    interval,
                },
                filters: [
                    ...filters,
                    ...(this.type === 'trace' || this.isHost ? [] : buildfilter(this.clusterName, this.namespace, this.isNode)),
                    ...this.isHost ? [{
                        key: 'logtype',
                        operator: 'is',
                        value: 'logfile',
                    }] : [],
                ],
                sort: {
                    timestamp: 'asc',
                },
            };
            if (task && task !== 'all') {
                body.filters.push({
                    key: 'logconfig',
                    operator: 'is',
                    value: task,
                });
            }

            return logseerService.elasticSearch({
                params: {
                    desensitize: false,
                },
                data: body,
            }).then(data => {
                this.loading = false;
                NProgress.done();
                return {
                    hits: data.hits.hits,
                    total: data.hits.total,
                };
            }).catch(err => {
                console.log(err);
                NProgress.done();
            });
        },
    },
};
</script>

<style module>
.searchHead{
    padding-top: 20px;
    background:#fff;
}
.searchHead[sticky="true"]{
    border-bottom: 1px solid #eee;
}
.tabswithnobody > div{
    display: none;
}
.topButton{
    border: none;
    padding: 0 8px;
}
</style>
