<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout
        v-if="isPlatform"
        direction="horizontal"
      >
        <u-button
          icon="create"
          color="primary"
          @click="openCreateModal"
        >
          新增租户
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
      </u-linear-layout>

      <x-request
        ref="request"
        :service="service"
        :params="{
          params: {
            user,
          }
        }"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <kube-table
            table-width="100%"
            :loading="loading"
            :columns="columns"
            :items="data ? data.list : []"
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
                <u-link-list-item @click="addProject(item)">
                  添加项目
                </u-link-list-item>
                <u-link-list-item @click="editInfo(item)">
                  修改名称
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #error>
              获取数据失败，请<u-link @click="refresh">
                重试
              </u-link>
            </template>
            <template #noData>
              还没有任何 租户 , 现在就
              <u-link @click="openCreateModal">
                立即创建
              </u-link>
              一个吧。
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
    <!-- <comp
      :columns="columns"
      :items="items"
    >
      <template
        #[`item.a`]="{ item }"
      >
        <span>{{ item.a }}</span>
      </template> -->
    <!-- <template
        #[`item.b`]="{ item }"
      >
        {{ item.b }}
      </template> -->
    <!-- </comp> -->
    </u-linear-layout>
    <tenant-dialog
      ref="tenantDialog"
      @refresh="refresh"
    />
    <project-dialog
      ref="projectDialog"
      @refresh="refresh"
    />
    <member-dialog
      ref="memberDialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import PageMixin from 'kubecube/mixins/pagenation';
import tenantDialog from './tenant-dialog.vue';
import projectDialog from './project-dialog.vue';
import memberDialog from './member-dialog.vue';
import {
    ROLES,
} from 'kubecube/utils/constance';
// import UserUploadDialog from './user-upload-dialog.vue';
import {
    toPlainObject,
} from 'kubecube/k8s-resources/scope/tenant';
export default {
    components: {
        tenantDialog,
        projectDialog,
        memberDialog,
    },
    metaInfo: {
        title: 'tenant - kubecube',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            service: userService.getUserTenants,
            columns: [
                { name: 'spec.displayName', title: '名称' },
                { name: 'metadata.name', title: '标识' },
                { name: 'metadata.creationTimestamp', title: '创建时间' },
                { name: 'operation', title: '操作', width: '200px' },
            ],
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
        userRole: get('scope/userRole'),
        isPlatform() {
            return this.userRole[ROLES.PLATFORM_ADMIN];
        },
    },
    methods: {
        resolver(result) {
            // console.log(result);
            const r = {
                list: (getFunc(result, 'items') || []).map(i => toPlainObject(i)),
                total: getFunc(result, 'total', 0),
            };
            console.log(r);
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        addMember(item) {
            this.$refs.memberDialog.open({
                tenant: {
                    value: item.metadata.name,
                },
            }, 'tenant');
        },
        addProject(item) {
            this.$refs.projectDialog.openInTenant(item.metadata.name);
        },
        onProjRefresh() {
            this.$router.push('/platform/tenant/project');
        },
        editInfo(item) {
            this.$refs.tenantDialog.open(item);
        },
        openCreateModal() {
            this.$refs.tenantDialog.open();
            console.log(this.$refs.user);
        },

    },

};
</script>

<style>

</style>
