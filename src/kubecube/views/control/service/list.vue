<template>
  <div>
    <div style="margin-bottom: 12px">
        <el-button
          type="primary"
          :disabled="isReview"
          @click="toCreate"
          icon="el-icon-plus"
        >
          创建{{ workloadLiteral }}
        </el-button>
        <el-button @click="refresh" square icon="el-icon-refresh-right"></el-button>
        <inputSearch v-model="filterName" placeholder="请输入名称搜索" position="right" @search="onSearch"/>
    </div>
    <div :key="workload">
        <x-request
            ref="request"
            :service="service"
            :params="requestParam"
            :processor="resolver"
        >
            <template slot-scope="{ data, loading, error }">
                <el-table
                    v-loading="loading"
                    :data="data ? data.list : []"
                    style="width: 100%"
                    border
                    :default-sort="defaultSort"
                    @sort-change="tableSortChange"
                >
                    <el-table-column
                        prop="metadata.name"
                        label="名称"
                        :show-overflow-tooltip="true"
                        sortable
                    >
                        <template slot-scope="{ row }">
                            <el-link type="primary" :to="{ path: `/control/${workload}/${row.metadata.name}`, query: $route.query }">
                                {{row.metadata.name}}
                            </el-link>
                        </template>
                    </el-table-column>
                    <template v-if="['services'].includes(workload)">
                        <el-table-column
                            prop="spec.type"
                            label="类型"
                            width="120"
                        >
                        </el-table-column>
                        <el-table-column
                            prop="spec.ports"
                            label="	内部访问地址"
                            width="160"
                        >
                            <template slot-scope="{ row }">
                                <el-tooltip effect="dark" content="Top Center 提示文字" placement="top">
                                     <div slot="content" v-html="(row.spec.ports || []).map(item => item.text).join('<br/>')"></div>
                                    <div :class="$style.textEllipsis">{{(row.spec.ports || []).map(item => item.text).join(', ')}}</div>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="spec.clusterIP"
                            label="	集群 IP"
                            width="100"
                            :show-overflow-tooltip="true"
                        >
                        </el-table-column>
                    </template>
                    <template v-if="['ingresses'].includes(workload)">
                        <el-table-column
                            prop="outside"
                            label="	外部访问地址"
                            width="160"
                            :show-overflow-tooltip="true"
                        >
                            <template slot-scope="{ row }">
                                {{row.outside || '-'}}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="spec.rules"
                            label="	规则"
                            width="200"
                        >
                            <template slot-scope="{ row }">
                                <el-tooltip effect="dark" content="Top Center 提示文字" placement="top">
                                     <div slot="content" v-html="ingressRuleFilter(row).join('<br/>')"></div>
                                    <div :class="$style.textEllipsis">{{ingressRuleFilter(row).join(', ')}}</div>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </template>
                    <el-table-column
                        prop="metadata.creationTimestamp"
                        label="创建时间"
                        width="170"
                        :show-overflow-tooltip="true"
                        sortable
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
                            <qz-link-group max="3"  :key="workload">
                                <el-link type="primary" @click="editItem(row)" :disabled="isReview">
                                    设置
                                </el-link>
                                <el-link type="primary" @click="deleteItem(row)" :disabled="isReview">
                                    删除
                                </el-link>
                                <el-link type="primary" @click="editYAML(row)" :disabled="isReview">
                                    YAML 设置
                                </el-link>
                            </qz-link-group>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                    style="float:right;margin-top:12px"
                    v-if="data && calculatePages(data.total) > 0"
                    @size-change="pageSizeChange"
                    @current-change="pageNumChange"
                    :current-page="pagenation.pageNum"
                    :page-sizes="[10, 20, 30, 40, 50, 100]"
                    :page-size="pagenation.pageSize"
                    layout="total, sizes, prev, pager, next"
                    :total="data.total"
                    background
                />
            </template>
        </x-request>
    </div>
  </div>
</template>

<script>
import { pickBy, get as getFun } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import PageMixin from 'kubecube/mixins/pagenation';
import { toPlainObject as toServicePlainObject } from 'kubecube/k8s-resources/service';
import { toPlainObject as toIngressPlainObject } from 'kubecube/k8s-resources/ingress';
import inputSearch from 'kubecube/elComponent/inputSearch/index.vue';
export default {
    components: {
        inputSearch,
    },
    metaInfo() {
        return {
            title: `${this.workload} - kubecube`,
        };
    },
    mixins: [ PageMixin ],
    data() {
        return {
            filterName: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userRole: get('scope/userRole'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            const keyMap = {
                services: 'services',
                ingresses: 'ingresses',
            };
            return !this.userResourcesPermission[keyMap[this.workload]];
        },
        service() {
            switch (this.workload) {
                case 'services':
                    return workloadExtendService.getWorkloads;
                case 'ingresses':
                    return workloadService.getNetworking;
                default:
                    return null;
            }
        },
        instanceService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.getAPIV1Instance;
                case 'ingresses':
                    return workloadService.getNetworkingInstance;
                default:
                    return null;
            }
        },
        modifyService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.modifyAPIV1Instance;
                case 'ingresses':
                    return workloadService.modifyNetworkingInstance;
                default:
                    return null;
            }
        },
        deleteService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.deleteAPIV1Instance;
                case 'ingresses':
                    return workloadService.deleteNetworkingInstance;
                default:
                    return null;
            }
        },
        workloadLiteral() {
            switch (this.workload) {
                case 'services':
                    return '服务';
                case 'ingresses':
                    return '负载均衡';
                default:
                    return '';
            }
        },
        columns() {
            switch (this.workload) {
                case 'services':
                    return [
                        { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: '类型', name: 'spec.type', width: '80px' },
                        { title: '内部访问地址', name: 'spec.ports', width: '120px', type: 'tag' },
                        { title: '集群 IP', name: 'spec.clusterIP', width: '100px' },
                        { title: '创建时间', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: '操作', name: 'operation', width: '160px' },
                    ];

                case 'ingresses':
                    return [
                        { title: '名称', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: '外部访问地址', name: 'outside', width: '120px' },
                        { title: '规则', name: 'spec.rules', width: '200px' },
                        { title: '创建时间', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: '操作', name: 'operation', width: '160px' },
                    ];
                default:
                    return [];
            }

        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                },
                params: {
                    ...pickBy(this.pagenation, i => !!i), // has to be this
                },
            };
        },
        workload() {
            return this.$route.params.workload;
        },
        toPlainObject() {
            switch (this.workload) {
                case 'services':
                    return toServicePlainObject;
                case 'ingresses':
                    return toIngressPlainObject;
                default:
                    return () => ({});
            }
        },
    },
    watch: {
        columns() {
            this.pagenation.sortName = 'metadata.creationTimestamp';
            this.pagenation.sortOrder = 'desc';
            this.pagenation.sortFunc = 'time';
            this.$refs.request.resetData();
        },
        workload() {
            this.pagenation.selector = '';
            this.filterName = '';
        },
    },
    created() {
        this.pagenation.sortName = 'metadata.creationTimestamp';
        this.pagenation.sortOrder = 'desc';
        this.pagenation.sortFunc = 'time';
        this.pagenation.selector = '';
        this.filterName = '';
    },
    methods: {
        ingressRuleFilter(item) {
            const strArr = [];
            const rules = getFun(item, 'spec.rules', []);
            rules.forEach(rule => {
                const host = getFun(rule, 'host');
                const paths = getFun(rule, 'http.paths', []);
                paths.forEach(path => {
                    const target = `${getFun(path, 'backend.service.name', '')}:${getFun(path, 'backend.service.port.number', '')}`
                    const source = `${host}${getFun(path, 'path', '')}`;
                    strArr.push(`${source}->${target}`);
                });
            });
            return strArr;
        },
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            const list = (response.items || []).map(this.toPlainObject);
            return {
                list,
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = `${name}`;
            this.pagenation.sortFunc = name === 'metadata.creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagenation.selector === temp) {
                this.refresh();
            }
            this.pagenation.selector = temp;
        },
        toCreate() {
            this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        view() {

        },
        async editYAML(item) {
            const reqParam = {
                pathParams: {
                    ...this.requestParam.pathParams,
                    name: item.metadata.name,
                },
            };
            const response = await this.instanceService(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— YAML 设置`,
                content: response,
                onSubmit: async content => {
                    await this.modifyService({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
        editItem(item) {
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/edit`,
            });
        },
        deleteItem(item) {
            this.$eConfirm({
                title: '删除',
                message: `确定删除 ${item.metadata.name} 吗？`,
                width: '460px',
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            ...this.requestParam.pathParams,
                            name: item.metadata.name,
                        },
                    };
                    if (this.workload === 'services') {
                        if (item.spec.template === 'headless' && !item.spec.enableSelecter) {
                            try {
                                await this.deleteEndpoints(item.metadata.name);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                    await this.deleteService(reqParam);
                    this.$refs.request.request();
                },
            });
        },
        async deleteEndpoints(name) {
            await workloadService.deleteAPIV1Instance({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'endpoints',
                    name,
                },
                noAlert: true,
            });
        },
    },
};
</script>

<style module>
.textEllipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
