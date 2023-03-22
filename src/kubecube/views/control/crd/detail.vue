<template>
  <div>
    <headCard
      :title="`${name} ${version}`"
    >
      <div slot="logo">
        {{ (name || '').substring(0, 2).toUpperCase() }}
      </div>
      <div slot="act">
        <operateList>
          <operateButtonOption @click="editYAML" :disabled="isReview">
          YAML 设置
          </operateButtonOption>
          <operateButtonOption @click="deleteCrd" :disabled="isReview">
          删除
          </operateButtonOption>
        </operateList>
      </div>
    </headCard>
    <x-request
      ref="request"
      :service="crdService"
      :params="crdParam"
      :processor="crdResolver"
    >
      <template slot-scope="{ data, loading }">
        <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
        <template v-else>
          <el-tabs value="instance" page="main">
            <el-tab-pane label="实例" name="instance"/>
          </el-tabs>
          <div>
            <el-button 
              type="primary"
              @click="toCreate(data)"
              icon="el-icon-plus"
              :disabled="isReview"
            >
              创建 {{ data.names.plural }}
            </el-button>
            <el-button @click="refresh" square icon="el-icon-refresh-right"></el-button>
          </div>
          <x-request
            ref="request"
            style="margin-top: 12px"
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
              <el-table
                v-loading="crLoading"
                :data="crData ? crData.list : []"
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
                  prop="metadata.creationTimestamp"
                  label="创建时间"
                  width="170"
                >
                  <template slot-scope="{ row }">
                  {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="操作"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link type="primary" @click="editItem(data, row)">YAML 设置</el-link>
                      <el-link type="primary" @click="deleteItem(data, row)">删除</el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                v-if="crData && calculatePages(crData.total) > 0"
                style="float:right;margin-top:12px"
                @size-change="pageSizeChange"
                @current-change="pageNumChange"
                :current-page="pagenation.pageNum"
                :page-sizes="[10, 20, 30, 40, 50, 100]"
                :page-size="pagenation.pageSize"
                layout="total, sizes, prev, pager, next"
                :total="crData.total"
                background
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
import headCard from 'kubecube/elComponent/head-card.vue';
export default {
    components: {
        headCard,
    },
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
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission['customresourcedefinitions'];
        },
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
            this.$eConfirm({
                title: '删除',
                message: `确认要删除 ${item.metadata.name} 吗？`,
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
        deleteCrd() {
            this.$eConfirm({
                title: '删除',
                message: `确认要删除 ${this.name} 吗？`,
                ok: async () => {
                    await workloadService.deleteCRDInstance({
                        ...this.crdParam
                    })
                    this.$router.push({
                        name: 'crd.list',
                        params: {
                            level: this.level,
                        },
                    });
                },
            });
        },
    },
};
</script>

<style>

</style>
