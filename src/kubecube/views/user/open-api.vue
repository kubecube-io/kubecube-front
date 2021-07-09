<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout direction="horizontal">
        <u-button
          icon="create"
          color="primary"
          @click="create"
        >
          添加秘钥
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
            <template #[`item.metadata.creationTimestamp`]="{ item }">
              {{ item.metadata.creationTimestamp | formatLocaleTime }}
            </template>
            <template #[`item.operation`]="{item}">
              <u-linear-layout>
                <u-linear-layout gap="small">
                  <span>properties 格式</span>
                  <u-easy-copy :text="'accessKey=' + item.metadata.name + '\n' + 'secretKey=' + item.spec.secretKey" />
                </u-linear-layout>
                <u-linear-layout gap="small">
                  <span>yaml 格式</span>
                  <u-easy-copy :text="'accessKey: ' + item.metadata.namey + '\n' + 'secretKey: ' + item.spec.secretKey" />
                </u-linear-layout>
                <u-link @click="remove(item)">
                  删除
                </u-link>
              </u-linear-layout>
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
  </div>
</template>

<script>
import { get } from 'lodash';
import userService from 'kubecube/services/user';
import PageMixin from 'kubecube/mixins/pagenation';

export default {
    components: {
        // UserUploadDialog,
    },
    metaInfo: {
        title: 'user - kubecube',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            service: userService.getUserKey,
            columns: [
                { name: 'metadata.name', title: 'accessKey' },
                { name: 'spec.secretKey', title: 'secretKey' },
                { name: 'metadata.creationTimestamp', title: '创建时间', width: '180px' },
                { name: 'operation', title: '操作', width: '180px' },
            ],
        };
    },
    methods: {
        resolver(result) {
            console.log(result);
            // const r = {
            //     list: get(result, 'items', []).map(i => toPlainObject(i)),
            //     total: get(result, 'total', 0),
            // };
            // console.log(r);
            return {
                list: result.items,
                total: result.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        async create() {
            await userService.createUserKey();
            this.refresh();
        },
        async remove(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除${item.metadata.name}吗？`,
                ok: async () => {
                    await userService.removeUserKey({
                        params: {
                            accessKey: item.metadata.name,
                        },
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
