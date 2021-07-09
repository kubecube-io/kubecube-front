<template>
  <div>
    <u-head-card
      :title="`${name} ${version}`"
    >
      <div slot="logo">
        {{ (name || '').substring(0, 2).toUpperCase() }}
      </div>
      <div slot="act">
        <u-detail-operate>
          <u-detail-operate-item @click="editYAML">
            YAML 设置
          </u-detail-operate-item>
          <u-detail-operate-item @click="deleteItem">
            删除
          </u-detail-operate-item>
        </u-detail-operate>
      </div>
    </u-head-card>
    <x-request
      ref="request"
      :service="crdService"
      :params="crdParam"
      :processor="crdResolver"
    >
      <template slot-scope="{ data, loading }">
        <u-loading v-if="loading" />
        <template v-else>
          <u-tabs>
            <u-tab title="实例" />
          </u-tabs>
          <u-linear-layout direction="horizontal">
            <u-button
              icon="create"
              color="primary"
              @click="toCreate(data)"
            >
              创建 {{ data.names.plural }}
            </u-button>
            <u-button
              icon="refresh"
              square
              @click="refresh"
            />
          </u-linear-layout>
          <x-request
            ref="request"
            style="margin-top: 20px"
            :service="crService"
            :params="{
              pathParams: {
                cluster,
                namespace,
                group: data.group,
                version: version,
                plural: data.names.plural,
              },
              params: pagenation
            }"
            :processor="crResolver"
          >
            <template slot-scope="{ data: crData, loading: crLoading, error }">
              <kube-table
                table-width="100%"
                :loading="crLoading"
                :columns="columns"
                :items="crData ? crData.list : []"
                :error="error"
              >
                <template #[`item.metadata.creationTimestamp`]="{ item }">
                  {{ item.metadata.creationTimestamp | formatLocaleTime }}
                </template>
                <template #[`item.operation`]="{ item }">
                  <u-linear-layout gap="small">
                    <u-link-list>
                      <u-link-list-item @click="editItem(data, item)">
                        设置 YAML
                      </u-link-list-item>
                      <u-link-list-item @click="deleteItem(data, item)">
                        删除
                      </u-link-list-item>
                    </u-link-list>
                  </u-linear-layout>
                </template>
                <template #noData>
                  <template v-if="pagenation.selector">
                    没有搜索到相关内容，可调整关键词重新搜索
                  </template>
                  <template v-else>
                    还没有任何 {{ data.names.plural }}
                  </template>
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
        </template>
      </template>
    </x-request>
  </div>
</template>

<script>
import workloadService from 'kubecube/services/k8s-resource';
import { get } from 'vuex-pathify';
import PageMixin from 'kubecube/mixins/pagenation';
import {
    toPlainObject as toCRDPlainObject,
} from 'kubecube/k8s-resources/crd';
import {
    toPlainObject as toConfigPlainObject,
} from 'kubecube/k8s-resources/base/config';
export default {
    mixins: [ PageMixin ],
    metaInfo() {
        return {
            title: `${this.name} - kubecube`,
        };
    },
    data() {
        return {
            crdService: workloadService.getCRDInstance,
            columns: [
                { title: '名称', name: 'metadata.name', textwrap: true },
                { title: '创建时间', name: 'metadata.creationTimestamp', width: '180px' },
                { title: '操作', name: 'operation', width: '200px' },
            ],
        };
    },
    computed: {
        cluster: get('scope/cluster@value'),
        namespace: get('scope/namespace@value'),
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
        name() {
            return this.$route.params.name;
        },
        version() {
            return this.$route.params.version;
        },
        crService() {
            if (this.level === 'Cluster') {
                return workloadService.getClusterCRResource;
            }
            return workloadService.getNamespaceCRResource;
        },
        crdParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    name: this.name,
                },
            };
        },
    },
    methods: {
        opCRService(op) {
            if (this.level === 'Cluster') {
                return workloadService[`${op}ClusterCRResource`];
            }
            return workloadService[`${op}NamespaceCRResource`];
        },
        getCRPathParams(data) {
            return {
                cluster: this.cluster,
                namespace: this.namespace,
                group: data.group,
                version: this.version,
                plural: data.names.plural,

            };
        },
        crdResolver(response) {
            return toCRDPlainObject(response);
        },
        crResolver(response) {
            return {
                list: (response.items || []).map(toConfigPlainObject),
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        toCreate(data) {
            this.$editResource({
                title: `${this.name} —— YAML 设置`,
                content: {
                    apiVersion: `${data.group}/${this.version}`,
                    kind: data.names.kind,
                    metadata: {
                        name: '',
                    },
                },
                onSubmit: async content => {
                    await this.opCRService('create')({
                        pathParams: this.getCRPathParams(data),
                        data: content,
                    });
                    this.refresh();
                },
            });
        },

        async editYAML() {
            const response = await workloadService.getCRDInstance(this.crdParam);
            this.$editResource({
                title: `${this.name} —— YAML 设置`,
                content: response,
                onSubmit: async content => {
                    await workloadService.modifyCRDInstance({
                        ...this.crdParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },

        editItem(data, item) {
            this.$editResource({
                title: `${item.metadata.name} —— YAML 设置`,
                content: item.puresource,
                onSubmit: async content => {
                    await this.opCRService('modify')({
                        pathParams: {
                            ...this.getCRPathParams(data),
                            name: item.metadata.name,
                        },
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
        deleteItem(data, item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    await this.opCRService('delete')({
                        pathParams: {
                            ...this.getCRPathParams(data),
                            name: item.metadata.name,
                        },
                    });
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
