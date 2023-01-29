<template>
  <div>
    <template v-if="workload === 'pods'">
      <div :class="$style.line_layout" style="margin-bottom: 20px">
        <div style="display: inline-block">
            <span style="margin-right:8px;line-height:32px">Container</span>
            <el-select
                v-if="containers.length"
                key="contianerlist"
                v-model="containerName"
                placeholder="请选择"
                style="width: 200px"
            >
                <el-option
                    v-for="item in containers"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value"
                    :title="item.text"
                />
            </el-select>
            <el-select
              v-else
              style="width:200px"
              placeholder="暂无Container"
              :disabled="true"
            />
        </div>
        <el-checkbox v-model="autoRefresh">
            自动刷新
        </el-checkbox>
        <span @click="switchSetting" :class="$style.switchButton">
            <span style="margin-right: 8px">切换背景</span>
            <i :class="$style.themeIcon" :theme="theme"></i>
        </span>
      </div>
    </template>
    <x-request
      v-else
      component="div"
      :service="podService"
      :params="params"
      :processor="resolver"
      style="margin-bottom: 20px"
      :class="$style.line_layout"
    >
      <template slot-scope="{ data }">
        <div style="display: inline-block">
            <span style="margin-right:8px;line-height:32px">副本</span>
            <el-select
                v-if="data && data.length"
                v-model="podName"
                placeholder="请选择"
                style="width: 200px"
            >
                <el-option
                    v-for="item in data"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value"
                    :title="item.text"
                />
            </el-select>
            <el-select
              v-else
              style="width:200px"
              placeholder="暂无副本"
              :disabled="true"
            />
        </div>
        <div style="display: inline-block">
            <span style="margin-right:8px;line-height:32px">Container</span>
            <el-select
                v-if="containers.length"
                v-model="containerName"
                placeholder="请选择"
                style="width: 200px"
            >
                <el-option
                    v-for="item in containers"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value"
                    :title="item.text"
                />
            </el-select>
            <el-select
              v-else
              style="width:200px"
              placeholder="暂无Container"
              :disabled="true"
            />
        </div>
        <el-checkbox v-model="autoRefresh">
            自动刷新
        </el-checkbox>
        <span @click="switchSetting" :class="$style.switchButton">
            <span style="margin-right: 8px">切换背景</span>
            <i :class="$style.themeIcon" :theme="theme"></i>
        </span>
      </template>
    </x-request>
    <template v-if="podName && containerName">
      <logContext
        :container-name="containerName"
        :pod-name="podName"
        :autoRefresh.sync="autoRefresh"
        :theme="theme"
      />
    </template>
  </div>
</template>

<script>
import { get as getFunc, omit } from 'lodash';
import { get } from 'vuex-pathify';
// import workloadService from '@micro-app/ncs/kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import {
    toPlainObject as toPodPlainObject,
} from 'kubecube/k8s-resources/pod/index.js';
import logContext from './component/log-context.vue';
function formatStartTime(val){
    if(!val)
        return Date.now() - 3600 * 24 * 1000;
    return val;
}
function formatEndTime(val){
    if(!val)
        return Date.now();
    return val;
}
function formatFilters(filters){
    return encodeURIComponent(JSON.stringify(filters))
}
export default {
    components: {
        logContext,
    },
    beforeRouteLeave(to, from, next) {
        if (to.query.podName || to.query.containerName) {
            next({
                path: to.path,
                query: omit(to.query, [ 'podName', 'containerName' ]),
            });
        } else {
            next();
        }
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            podService: workloadExtendService.getWorkloads,
            podName: this.$route.query.podName || null,
            containerName: this.$route.query.containerName || null,
            pods: [],
            interval: '1m',
            task: 'all',
            autoRefresh: false,
            theme: 'light',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        tenant: get('scope/tenant'),
        project: get('scope/project'),
        workload() {
            return this.$route.params.workload;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                },
                params: {
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    selector: `metadata.ownerReferences.uid=${this.instance.metadata.uid}`
                    // selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                },
            };
        },
        containers() {
            let target;
            if (this.workload === 'pods') {
                target = this.instance;
            } else {
                const data = this.pods || [];
                target = data.find(d => d.metadata.name === this.podName);
            }
            return getFunc(target, 'containers', []).map(c => ({
                text: c.containerName,
                value: c.containerName,
                ...c,
            }));
        },
    },
    created() {
        if (this.workload === 'pods') {
            this.podName = this.instance.metadata.name;
            this.containerName = getFunc(this.instance, 'containers[0].containerName');
        }
    },
    methods: {
        switchSetting() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
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
            let containers = [];
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: this.podName,
            }, val => {
                this.podName = getFunc(val, 'value');
                containers = getFunc(val, 'containers');
            });
            setValueIfListNotPresent({
                list: containers,
                path: 'containerName',
                current: this.containerName,
            }, val => {
                this.containerName = getFunc(val, 'containerName');
            });
            // this.podName = getFunc(items, '[0].value');
            this.pods = items;
            // this.containerName = getFunc(items, '[0].containers[0].containerName');
            return items;
        },
    },
};
</script>

<style module>
.line_layout > * {
    margin-right: 12px;
}
.switchButton {
    float: right;
    cursor: pointer;
    display: flex;
    align-items: center;
}
.themeIcon::before {
    font-size: 22px;
    color: #c9cfd8;
    icon-font: url(kubecube/assets/log-white.svg);
}
.themeIcon[theme="dark"]::before {
    icon-font: url(kubecube/assets/log-black.svg);
}
</style>
