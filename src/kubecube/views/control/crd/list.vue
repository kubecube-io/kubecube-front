<template>
  <div>
    <template v-if="isInSubRoute">
      <router-view />
    </template>
    <x-request
      v-else
      ref="request"
      :service="service"
      :params="reqParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <el-table
          v-loading="loading"
          :data="data ? data.list : []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="metadata.name"
            label="名称"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="group"
            label="组"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="versions"
            label="版本"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                v-for="version in row.versions"
                :key="version"
                type="primary"
                :to="{ path: `/control/crd/${level}/${row.metadata.name}/${version}`, query: $route.query }"
                style="margin-right: 8px"
              >
                {{version}}
              </el-link>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="data && calculatePages(data.total) > 0"
          style="float:right;margin-top:12px"
          @size-change="pageSizeChange"
          @current-change="pageNumChange"
          :current-page="pagenation.pageNum"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="pagenation.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="data.total"
          background
        />



        <!-- <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          :resizable="true"
          @sort="onSort"
        >
          <template #[`item.versions`]="{ item }">
            <u-link
              v-for="version in item.versions"
              :key="version"
              :to="{ path: `/control/crd/${level}/${item.metadata.name}/${version}`}"
            >
              {{ version }}
            </u-link>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              没有搜索到相关内容，可调整关键词重新搜索
            </template>
            <template v-else>
              还没有任何 自定义资源
            </template>
          </template>
          <template #error>
            获取数据失败，请
            <u-link @click="refresh">
              重试
            </u-link>
          </template>
        </kube-table>
        <u-page
          v-if="data && calculatePages(data.total) > 0"
          :page="pagenation.pageNum"
          :count="data.total"
          :page-size="pagenation.pageSize"
          :total="calculatePages(data.total)"
          @select="selectPage"
        /> -->
      </template>
    </x-request>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import workloadService from 'kubecube/services/k8s-resource';
import { get } from 'vuex-pathify';
import PageMixin from 'kubecube/mixins/pagenation';
import {
    toPlainObject as toCRDPlainObject,
} from 'kubecube/k8s-resources/crd';
export default {
    mixins: [ PageMixin ],
    props: {
        selector: String,
        refreshKey: Number,
    },
    data() {
        return {
            service: workloadService.getCRD,
            columns: [
                { title: '名称', name: 'metadata.name', textwrap: true },
                { title: '组', name: 'group', textwrap: true },
                { title: '版本', name: 'versions', textwrap: true },
            ],
        };
    },
    computed: {
        isInSubRoute() {
            return this.$route.name === 'crd.detail';
        },
        cluster: get('scope/cluster@value'),
        reqParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                },
                params: {
                    ...this.pagenation,
                    selector: `${this.selector},spec.scope=${this.level}`,
                },
            };
        },
        level() {
            return this.$route.params.level;
        },
    },
    watch: {
        refreshKey() {
            this.$refs.request.request();
        },
        level() {
            Object.assign(this.pagenation, {
                pageNum: 1,
                pageSize: 10,
                sortOrder: 'asc',
                sortName: undefined,
                selector: '',
            });
        },
    },
    methods: {
        resolver(response) {
            console.log(response);
            return {
                list: (getFunc(response, 'items') || []).map(toCRDPlainObject),
                total: response.total,
            };
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = name;
            this.pagenation.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        refresh() {
            this.$refs.request.request();
        },
    },
};
</script>

<style>

</style>
