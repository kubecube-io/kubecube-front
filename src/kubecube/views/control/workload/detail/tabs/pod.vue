<template>
  <x-request
    ref="request"
    :service="podService"
    :params="params"
    :processor="resolver"
    :poll="{ interval: 8000 }"
  >
    <template slot-scope="{ data, loading }">
      <u-info-list-group title="基本信息">
        <kube-table
          table-width="100%"
          :columns="columns"
          :loading="loading"
          :items="data || []"
        >
          <template #[`item.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list>
                <u-link-list-item @click="viewYAML(item)">
                  查看详细信息
                </u-link-list-item>
                <u-link-list-item @click="toEvent(item)">
                  查看事件
                </u-link-list-item>
                <u-link-list-item @click="deleteItem(item)">
                  删除
                </u-link-list-item>
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            暂无 副本 详情
          </template>
        </kube-table>
      </u-info-list-group>
      <u-info-list-group title="容器详情">
        <div :class="$style.gap">
          <u-linear-layout>
            <u-text>副本</u-text>
            <u-select
              v-if="data && data.length"
              key="list"
              v-model="podName"
              :data="data"
              size="large"
            />
            <u-select
              v-else
              key="none"
              :data="[{ text: '暂无副本' }]"
              size="large"
              disabled
            />
          </u-linear-layout>
          <kube-table
            table-width="100%"
            :columns="containerColumns"
            :loading="loading"
            :items="getContainer(data || [])"
          >
            <template #[`item.containerName`]="{ item }">
              <u-linear-layout gap="small">
                <u-icons
                  v-tooltip.top="getContainerText(item.type)"
                  style="color: #508de8;"
                  :name="item.type | getContainerIcon"
                />
                <u-link
                  :to="{ path: `/control/${$route.params.workload}/${$route.params.instance}/${podName}/${item.containerName}`}"
                >
                  {{ item.containerName }}
                </u-link>
              </u-linear-layout>
            </template>
            <template #[`item.status`]="{ item }">
              {{ Object.keys(item.status.state)[0] }}
            </template>
            <template #[`item.operation`]="{ item }">
              <u-linear-layout gap="small">
                <u-link-list>
                  <u-link-list-item @click="$kubeterm({ pod: podName, container: item.containerName })">
                    console
                  </u-link-list-item>
                  <u-link-list-item @click="toLog(item)">
                    查看日志
                  </u-link-list-item>
                </u-link-list>
              </u-linear-layout>
            </template>
            <template #noData>
              暂无 容器 详情
            </template>
          </kube-table>
        </div>
      </u-info-list-group>
      <!-- <kube-term ref="kubeterm" /> -->
    </template>
  </x-request>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubecube/k8s-resources/pod/index.js';
import { CONTAINERTYPE } from 'kubecube/utils/constance';
// import kubeTerm from 'kubecube/component/global/xterm/kube-terminal.vue';
export default {
    filters: {
        getContainerIcon(type) {
            return (CONTAINERTYPE[type] || {}).icon || 'container';
        },
    },
    // components: {
    //     kubeTerm,
    // },
    props: {
        instance: Object,
    },
    data() {
        return {
            podService: workloadExtendService.getWorkloads,
            columns: [
                { title: '副本名称', name: 'metadata.name' },
                { title: '副本状态', name: 'status.phase', width: '80px' },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: '所在节点IP', name: 'status.hostIP', width: '100px' },
                { title: '重启次数', name: 'status.restartCount', width: '100px' },
                { title: '创建时间', name: 'creationTimestamp', width: '180px' },
                { title: '操作', name: 'operation', width: '200px' },
            ],
            podName: null,
            containerColumns: [
                { title: '容器名称', name: 'containerName' },
                { title: '镜像', name: 'image', width: '40%' },
                { title: '容器状态', name: 'status', width: '100px' },
                { title: '重启次数', name: 'status.restartCount', width: '100px' },
                { title: '操作', name: 'operation', width: '200px' },

            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                },
                params: {
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                },
            };
        },
    },

    methods: {
        getContainerText(type) {
            return (CONTAINERTYPE[type] || {}).text || '业务容器';
        },
        resolver(response) {
            const items = (response.items || []).map(r => {
                const pod = toPodPlainObject(r);
                return {
                    text: pod.metadata.name,
                    value: pod.metadata.name,
                    ...pod,
                };
            });
            console.log(items);
            this.podName = getFunc(items, '[0].value');
            return items;
        },
        getContainer(data) {
            data = data || [];
            const target = data.find(d => d.metadata.name === this.podName);
            return getFunc(target, 'containers', []);
        },
        toEvent(item) {
            this.$router.push({ name: 'control.workload.event', params: this.$route.params, query: {
                kind: 'pod',
                pod: item.metadata.name,
                type: 'current',
            } });
        },
        toLog(container) {
            this.$router.push({
                name: 'control.workload.log',
                params: this.$route.params,
                query: {
                    podName: this.podName,
                    containerName: container.containerName,
                },
            });
        },
        async deleteItem(item) {
            this.$confirm({
                title: '删除',
                content: `确认要删除 ${item.metadata.name} 吗？`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'pods',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteAPIV1Instance(reqParam);
                    this.$refs.request.request();
                },
            });


        },
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getAPIV1Instance(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— 查看 YAML`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });
        },
    },
};
</script>

<style module>
.gap > *{
    margin-top: 20px;
}
</style>
