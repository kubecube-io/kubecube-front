<template>
  <div>
    <u-steps :value="step">
      <u-step title="基本信息">
        <basic-info
          v-model="model"
          @go="changeStep"
        />
      </u-step>
      <u-step title="容器配置">
        <container-info
          v-model="model"
          @go="changeStep"
        />
      </u-step>
      <u-step title="高级配置">
        <advance-info
          v-model="model"
          :resolve-data="resolveData"
          @go="changeStep"
        />
      </u-step>
    </u-steps>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubecube/services/k8s-resource';
import {
    toPlainObject as toDeploymentPlainObject,
    toK8SObject as toDeploymentK8SObject,
    toModifyK8SObject as toModifyDeploymentK8SObject,
} from 'kubecube/k8s-resources/deployment/index.js';
import {
    toPlainObject as toStatefulsetPlainObject,
    toK8SObject as toStatefulsetK8SObject,
    toModifyK8SObject as toModifyStatefulsetK8SObject,
} from 'kubecube/k8s-resources/statefulset/index.js';
import {
    toPlainObject as toDaemonsetPlainObject,
    toK8SObject as toDeamonsetK8SObject,
    toModifyK8SObject as toModifyDeamonsetK8SObject,
} from 'kubecube/k8s-resources/daemonsets/index.js';
import {
    toPlainObject as toJobPlainObject,
    toK8SObject as toJobK8SObject,
} from 'kubecube/k8s-resources/job/index.js';
import {
    toPlainObject as toCronJobPlainObject,
    toK8SObject as toCronJobK8SObject,
    toModifyK8SObject as toModifyJobK8SObject,
} from 'kubecube/k8s-resources/cronjob';
import { toPlainObject as toMetadataPlainObject } from 'kubecube/k8s-resources/metadata.js';
import basicInfo from './info/basic-info.vue';
import containerInfo from './container/container-info.vue';
import advanceInfo from './advance/advance-info.vue';

export default {
    metaInfo() {
        return {
            title: `${this.workload} - kubecube`,
        };
    },
    components: {
        basicInfo,
        containerInfo,
        advanceInfo,
    },
    provide() {
        return {
            resources: this.resources,
            updateResource: this.loadRes,
        };
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            step: 0,
            model: {},
            resources: {
                configmaps: null,
                emptydir: null,
                hostpath: null,
                persistentvolumeclaims: null,
                secrets: null,
            },
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        getService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.getInstance;
                case 'jobs':
                    return workloadService.getBatchInstance;
                case 'cronjobs':
                    return workloadService.getBatchsBetaInstance;
                default:
                    return null;
            }
        },
        toPlainObject() {
            switch (this.workload) {
                case 'deployments':
                    return toDeploymentPlainObject;
                case 'statefulsets':
                    return toStatefulsetPlainObject;
                case 'jobs':
                    return toJobPlainObject;
                case 'cronjobs':
                    return toCronJobPlainObject;
                case 'daemonsets':
                    return toDaemonsetPlainObject;
                default:
                    return () => ({});
            }
        },
        toK8SObject() {
            switch (this.workload) {
                case 'deployments':
                    return toDeploymentK8SObject;
                case 'statefulsets':
                    return toStatefulsetK8SObject;
                case 'jobs':
                    return toJobK8SObject;
                case 'cronjobs':
                    return toCronJobK8SObject;
                case 'daemonsets':
                    return toDeamonsetK8SObject;
                default:
                    return () => ({});
            }
        },
        toModifiedObject() {
            switch (this.workload) {
                case 'deployments':
                    return toModifyDeploymentK8SObject;
                case 'statefulsets':
                    return toModifyStatefulsetK8SObject;
                case 'cronjobs':
                    return toModifyJobK8SObject;
                case 'daemonsets':
                    return toModifyDeamonsetK8SObject;
                default:
                    return () => ({});
            }
        },
        modifyService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.modifyWorkload;
                case 'jobs':
                    return workloadService.modifyBatchInstance;
                case 'cronjobs':
                    return workloadService.modifyBatchsBetaInstance;
                default:
                    return null;
            }
        },
        createService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.createWorkload;
                case 'jobs':
                    return workloadService.createBatchs;
                case 'cronjobs':
                    return workloadService.createBatchsBeta;
                default:
                    return null;
            }
        },
    },
    created() {
        this.loadResources();
        this.model = cloneDeep(this.instance) || this.toPlainObject();
    },
    methods: {
        async loadResources() {
            await Promise.all([
                'configmaps', 'persistentvolumeclaims', 'secrets',
            ].map(k => this.loadRes(k)));
        },
        async loadRes(resource) {
            const response = await workloadService.getAPIV1({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource,
                },
                params: {
                    pageSize: 10000,
                },
            });
            this.resources[resource] = response.items.map(i => {
                const p = toMetadataPlainObject(i);
                return {
                    text: p.name,
                    value: p.name,
                    ...i,
                };
            });
        },
        changeStep(step) {
            this.step += step;
        },
        updateResource(key, value) {
            this.$set(this.resources, key, value);
        },
        async resolveData() {

            if (this.isEdit) {
                const yaml = this.toModifiedObject(this.model);
                // debugger
                await this.modifyService({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: this.workload,
                        name: yaml.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = this.toK8SObject(this.model);
                await this.createService({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: this.workload,
                    },
                    data: yaml,
                });
            }
        },
    },
};
</script>

<style>

</style>
