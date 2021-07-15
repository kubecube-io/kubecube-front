<template>
  <div>
    <template v-if="workload === 'pods'">
      <u-linear-layout style="margin-bottom: 20px">
        <u-text>Container</u-text>
        <u-select
          v-if="containers.length"
          key="contianerlist"
          v-model="containerName"
          :data="containers"
          size="normal"
        />
        <u-select
          v-else
          key="nonecontainer"
          :data="[{ text: '暂无Container' }]"
          size="normal"
          disabled
        />
        <u-link @click="toPodLog">
          查看详细日志
        </u-link>
      </u-linear-layout>
    </template>
    <x-request
      v-else
      component="u-linear-layout"
      :service="podService"
      :params="params"
      :processor="resolver"
      style="margin-bottom: 20px"
    >
      <template slot-scope="{ data }">
        <u-text>副本</u-text>
        <u-select
          v-if="data && data.length"
          key="podlist"
          v-model="podName"
          :data="data"
          size="normal"
        />
        <u-select
          v-else
          key="nonepod"
          :data="[{ text: '暂无副本' }]"
          size="normal"
          disabled
        />
        <u-text>Container</u-text>
        <u-select
          v-if="containers.length"
          key="contianerlist"
          v-model="containerName"
          :data="containers"
          size="normal"
        />
        <u-select
          v-else
          key="nonecontainer"
          :data="[{ text: '暂无Container' }]"
          size="normal"
          disabled
        />
        <u-link @click="toPodLog">
          查看详细日志
        </u-link>
      </template>
    </x-request>
    <template v-if="podName && containerName">
      <logContext
        :container-name="containerName"
        :pod-name="podName"
      />
    </template>
  </div>
</template>

<script>
import { get as getFunc, omit } from 'lodash';
import { get } from 'vuex-pathify';
// import workloadService from 'kubecube/services/k8s-resource';
import workloadExtendService from 'kubecube/services/k8s-extend-resource';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import {
    toPlainObject as toPodPlainObject,
} from 'kubecube/k8s-resources/pod/index.js';
import logContext from './component/log-context.vue';

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
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
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
                    selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
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
        toPodLog() {
            this.$store.dispatch('lens/setToDefault');
            this.$store.commit('like/RESET');
            this.$store.dispatch('timer/setTimer');

            this.$store.commit('lens/setFilters', [
                {
                    key: 'pod_name',
                    operator: 'is',
                    value: this.podName,
                },
            ]);

            this.$router.push({
                path: '/control/lens/normal',
            });
        },
    },
};
</script>

<style module>

</style>
