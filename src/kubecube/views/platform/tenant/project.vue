<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout
        direction="horizontal"
        class="kube-clear"
      >
        <template v-if="isPlatform || isTenant">
          <u-button
            icon="create"
            color="primary"
            @click="openCreateModal"
          >
            新增项目
          </u-button>

          <u-button
            icon="refresh"
            square
            @click="refresh"
          />
        </template>
        <kube-pipe
          ref="tenantpipe"
          key="project"
          style="float: right;"
          component="u-linear-layout"
          graph="tenant"
          direction="horizontal"
          @pipestatechange="pipeLoading = $event"
        >
          <u-text>租户</u-text>
          <kube-tenant-select v-model="tenant" />
        </kube-pipe>
      </u-linear-layout>

      <x-request
        v-if="!pipeLoading"
        ref="request"
        :service="service"
        :params="params"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <kube-table
            table-width="100%"
            :loading="loading"
            :columns="columns"
            :items="currentList"
            :error="error"
          >
            <template #[`item.metadata.creationTimestamp`]="{ item }">
              {{ item.metadata.creationTimestamp | formatLocaleTime }}
            </template>
            <template #[`item.operation`]="{item}">
              <u-link-list>
                <u-link-list-item @click="addMember(item)">
                  添加成员
                </u-link-list-item>
                <u-link-list-item @click="editInfo(item)">
                  修改名称
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #noData>
              还没有任何 项目 , 现在就
              <u-link @click="openCreateModal">
                立即创建
              </u-link>
              一个吧。
            </template>
            <template #error>
              获取数据失败，请<u-link @click="refresh">
                重试
              </u-link>
            </template>
          </kube-table>
          <u-page
            v-if="data && calculatePages(data.total) > 1"
            :count="data.total"
            :page-size="pagenation.pageSize"
            :total="calculatePages(data.total)"
            @select="selectPage"
          />
        </template>
      </x-request>
    </u-linear-layout>
    <project-dialog
      ref="dialog"
      @refresh="refresh"
    />
    <member-dialog
      ref="memberdialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import PageMixin from 'kubecube/mixins/pagenation';
import projectDialog from './project-dialog.vue';
import memberDialog from './member-dialog.vue';
import kubeTenantSelect from 'kubecube/component/global/common/kube-tenant-select.vue';
import {
    toPlainObject,
} from 'kubecube/k8s-resources/scope/project';
import {
    ROLES,
} from 'kubecube/utils/constance';
export default {
    components: {
        projectDialog,
        kubeTenantSelect,
        memberDialog,
    },
    metaInfo: {
        title: 'project - kubecube',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            tenant: null,
            pipeLoading: true,
            service: userService.getUserProjects,
            columns: [
                { name: 'spec.displayName', title: '项目名称' },
                { name: 'metadata.name', title: '项目标识' },
                { name: 'tenant', title: '所属租户' },
                { name: 'metadata.creationTimestamp', title: '创建时间', width: '200px' },
                { name: 'operation', title: '操作', width: '160px' },
            ],
            list: [],
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
        userRole: get('scope/userRole'),
        isPlatform() {
            return this.userRole[ROLES.PLATFORM_ADMIN];
        },
        isTenant() {
            return this.userRole[ROLES.TENANT_ADMIN];
        },
        isProject() {
            return this.userRole[ROLES.PROJECT_ADMIN];
        },
        params() {
            console.log(this.tenant);
            return {
                params: {
                    user: this.user,
                    tenant: getFunc(this.tenant, 'value'),
                },
            };
        },
        currentList() {
            const start = (this.pagenation.pageNum - 1) * this.pagenation.pageSize;
            const end = start + this.pagenation.pageSize;
            return this.list.slice(start, end);
        },
    },
    methods: {
        resolver(result) {
            console.log(result, getFunc(result, 'items', []));
            const r = {
                list: (getFunc(result, 'items') || []).map(i => toPlainObject(i)),
                total: getFunc(result, 'total', 0),
            };
            console.log(r);
            this.list = r.list;
            return r;
        },
        refresh(tenant) {
            this.$refs.request.request();
            if (tenant && typeof tenant === 'string') {
                this.tenant = {
                    value: tenant,
                };
            }
        },
        addMember(item) {
            console.log(item);
            this.$refs.memberdialog.open({
                tenant: {
                    value: item.tenant,
                },
                project: {
                    value: item.metadata.name,
                },
            }, 'project');
        },
        editInfo(item) {
            this.$refs.dialog.open(item);
        },
        openCreateModal() {
            this.$refs.dialog.open();
            console.log(this.$refs.user);
        },

    },

};
</script>

<style>

</style>
