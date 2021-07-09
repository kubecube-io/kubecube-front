<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout direction="horizontal">
        <u-button
          icon="create"
          color="primary"
          @click="openCreateModal"
        >
          新增用户
        </u-button>
        <u-button
          icon="create"
          color="primary"
          @click="$refs.upload.open()"
        >
          批量导入
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
      </u-linear-layout>

      <x-request
        ref="request"
        :service="userService"
        :params="{}"
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
            <template #[`item.lastLoginTime`]="{ item }">
              {{ item.lastLoginTime | formatLocaleTime }}
            </template>
            <template #[`item.state`]="{ item }">
              {{ item.state | formatStatus }}
            </template>
            <template #[`item.operation`]="{item}">
              <u-link-list>
                <u-link-list-item @click="edit(item)">
                  修改信息
                </u-link-list-item>
                <u-link-list-item @click="editPWD(item)">
                  修改密码
                </u-link-list-item>
                <u-link-list-item @click="editStatus(item)">
                  {{ item.state === 'normal' ? '禁用' : '启用' }}
                </u-link-list-item>
              </u-link-list>
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
    <user-dialog
      ref="user"
      @refresh="refresh"
    />
    <user-upload-dialog ref="upload" />
  </div>
</template>

<script>
import { get } from 'lodash';
import userService from 'kubecube/services/user';
import PageMixin from 'kubecube/mixins/pagenation';
import userDialog from './user-dialog.vue';
import UserUploadDialog from './user-upload-dialog.vue';
export default {
    components: {
        userDialog,
        UserUploadDialog,
    },
    metaInfo: {
        title: 'user - kubecube',
    },
    filters: {
        formatStatus(val) {
            if (val === 'normal') {
                return '启用';
            }
            return '禁用';

        },
    },
    mixins: [ PageMixin ],
    data() {
        return {
            userService: userService.getUserList,
            columns: [
                { name: 'name', title: '登录帐号' },
                { name: 'displayName', title: '用户名' },
                { name: 'loginType', title: '类型' },
                { name: 'lastLoginIP', title: '上次登录 IP' },
                { name: 'lastLoginTime', title: '上次登录时间', width: '200px' },
                { name: 'state', title: '状态', width: '100px' },
                { name: 'operation', title: '操作', width: '200px' },
            ],
        };
    },
    methods: {
        resolver(result) {
            const r = {
                list: get(result, 'items', []).map(i => ({
                    name: i.name,
                    ...i.spec,
                    ...i.status,
                })),
                total: get(result, 'sum', 0),
            };
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        edit(user) {
            this.$refs.user.open(user);
        },
        editPWD(user) {
            this.$refs.user.open(user, true);
        },
        async editStatus(item) {
            const nextStatus = item.state === 'normal' ? 'forbidden' : 'normal';
            await userService.modifyUser({
                pathParams: {
                    user: item.name,
                },
                data: {
                    spec: {
                        state: nextStatus,
                    },
                },
            });
            this.refresh();
        },
        openCreateModal() {
            this.$refs.user.open();
            console.log(this.$refs.user);
        },
    },

};
// import makePagenationMixin from 'kubecube/components/src/ui/mixins/pagenation';
// import userService from 'kubecube/services/user';
// import UserDialog from './user-dialog.vue';
// import UserUploadDialog from './user-upload-dialog.vue';
// export default {
//     components: {
//         UserDialog,
//         UserUploadDialog
//     },
//     metaInfo: {
//         title: 'kubecube',
//         titleTemplate: '%s - User'
//     },
//     extends: makePagenationMixin,
//     data: () => ({
//         total: 0,
//         list: [],
//         loading: true,

//         editedItem: null,
//         dialogVisible: false,
//     }),
//     computed: {
//         headers(){
//             return [
//                 { text: this.$t('Account'), sortable: false, value: 'name' },
//                 { text: this.$t('AccountName'), value: 'displayName', sortable: false},
//                 { text: this.$t('Type'), value: 'loginType', sortable: false},
//                 { text: this.$t('lastLoginIP'), value: 'lastLoginIP', sortable: false},
//                 { text: this.$t('lastLoginTime'), value: 'lastLoginTime', sortable: false},
//                 { text: this.$t('Operation'), value: 'operation', sortable: false },
//             ];
//         }
//     },
//     watch: {
//         '$route.query'() {
//             this.getDataFromApi();
//         },
//     },
//     created() {
//         this.getDataFromApi();
//     },
//     methods: {
//         editItem(item){
//             this.editedItem = item;
//             this.$refs.userDialog.dialog = true;
//         },
//         getDataFromApi () {
//             this.loading = true;
//             this.requestUserList().then(data => {
//                 this.list = data.items;
//                 this.total = data.total;
//                 this.loading = false;
//             });
//         },
//         async requestUserList() {
//             try {
//                 const response = await userService.getUserList({
//                     params: this.pagenation
//                 });
//                 return {
//                     items: response.items.map(i => ({
//                         name: i.name,
//                         ...i.spec,
//                         ...i.status,
//                     })),
//                     total: response.sum,
//                 };
//             } catch(err) {
//                 return {
//                     items: [],
//                     total: 0,
//                 };
//             }
//         },
//         onDialogClose() {
//             this.editedItem = null;
//             console.log('closed');
//         },
//         onDialogCommit() {
//             this.editedItem = null;
//             this.getDataFromApi();
//         }
//     },
// };
</script>

<style>

</style>
