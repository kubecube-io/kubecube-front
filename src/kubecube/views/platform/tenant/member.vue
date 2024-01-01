<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout direction="horizontal">
        <u-button
          icon="create"
          color="primary"
          @click="addMember"
        >
          添加成员
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
        <kube-pipe
          key="member"
          style="float: right;"
          component="u-linear-layout"
          graph="tenant > project > role"
          direction="horizontal"
          @pipestatechange="pipeLoading = $event"
        >
          <u-text>租户</u-text>
          <kube-tenant-select v-model="tenant" />
          <u-text>项目</u-text>
          <kube-project-select
            v-model="project"
            :tenant="tenant && tenant.value"
          />
          <u-text>角色</u-text>
          <kube-role-select
            v-model="role"
            :tenant="tenant"
            :project="project"
          />
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
                <!-- <u-link-list-item @click="modify(item)">
                  修改权限
                </u-link-list-item> -->
                <u-link-list-item @click="remove(item)">
                  移除成员
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #noData>
              还没有任何 成员 , 现在就
              <u-link @click="addMember">
                立即创建
              </u-link>
              一个吧。
            </template>
            <template #error>
              未选择任何租户项目
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
    <member-dialog
      ref="memberdialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get as getFromStore } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import roleBindingService from 'kubecube/services/role-binding';
import PageMixin from 'kubecube/mixins/pagenation';
import memberDialog from './member-dialog.vue';
// import UserUploadDialog from './user-upload-dialog.vue';
import kubeTenantSelect from 'kubecube/component/global/common/kube-tenant-select.vue';
import kubeProjectSelect from 'kubecube/component/global/common/kube-project-select.vue';
import kubeRoleSelect from 'kubecube/component/global/common/kube-role-select.vue';
export default {
    components: {
        memberDialog,
        kubeTenantSelect,
        kubeProjectSelect,
        kubeRoleSelect,
        // UserUploadDialog,
    },
    metaInfo: {
        title: '成员 - kubecube',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            tenant: null,
            project: null,
            role: null,
            pipeLoading: true,
            service: userService.getMembers,
            columns: [
                { name: 'metadata.name', title: '账号' },
                { name: 'role', title: '角色' },
                { name: 'tenant', title: '所属租户' },
                { name: 'project', title: '所属项目' },
                { name: 'metadata.creationTimestamp', title: '创建时间', width: '200px' },
                { name: 'operation', title: '操作', width: '160px' },
            ],
            list: [],
        };
    },
    computed: {
        userRole: getFromStore('scope/userRole'),
        roleList() {
            return this.userRole.clusterRoles.items.map(p => ({
                text: p, value: p,
            }));
        },
        params() {
            const params = {
              role: this.role.value,
            };
            if (getFunc(this.tenant, 'value')) {
              params.scopetype = 'tenant';
              params.scopename = this.tenant.value;
            }
            if (getFunc(this.project, 'value')) {
              params.scopetype = 'project';
              params.scopename = this.project.value;
            }
            return {
                params,
            };
        },
        currentList() {
            const start = (this.pagenation.pageNum - 1) * this.pagenation.pageSize;
            const end = start + this.pagenation.pageSize;
            return this.list.slice(start, end);
        },
    },
    methods: {
        toUserPlainObject(item) {
          return {
            metadata: item.metadata,
            role: this.role.value,
            ...getFunc(item, 'status.belongProjectInfos[0]', {})
          };
        },
        resolver(result) {
            const r = {
                list: (getFunc(result, 'items') || []).map(i => this.toUserPlainObject(i)),
                total: getFunc(result, 'total', 0),
            };
            this.list = r.list;
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        addMember() {
            this.$refs.memberdialog.open({
                tenant: this.tenant,
                project: this.project,
                role: this.role,
            });
        },
        modify(item) {
            console.log(item);
            this.$refs.memberdialog.open({
                tenant: this.tenant,
                project: this.project,
                role: this.role,
                user: item.user,
            });
        },
        remove(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const params = {
                        user: item.metadata.name,
                    };
                    if (getFunc(this.tenant, 'value')) {
                        params.scopetype = 'tenant';
                        params.scopename = this.tenant.value;
                    }
                    if (getFunc(this.project, 'value')) {
                        params.scopetype = 'project';
                        params.scopename = this.project.value;
                    }
                    await userService.deleteMember({
                        params
                    });
                    this.refresh();
                },
            });
        },
    },

};
</script>

<style>

</style>
