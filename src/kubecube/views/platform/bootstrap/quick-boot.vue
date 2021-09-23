<template>
  <kube-tab
    ref="tab"
    v-model="tabs"
    title-key="title"
    tab-key="tab"
    disabled
    @tabChange="tabChange"
  >
    <template #tenant="{ model, state }">
      <tenantBoot
        v-model="model.model"
        :state="state"
        @next="next($event)"
      />
    </template>
    <template #tenantquota="{ model, state }">
      <tenantQuotaBoot
        v-model="model.model"
        :state="state"
        @next="next()"
      />
    </template>
    <template #project="{ model, state }">
      <project-boot
        v-model="model.model"
        :state="state"
        @next="next($event)"
      />
    </template>
    <template #member="{ model, state }">
      <member-boot
        v-model="model.model"
        :state="state"
        @next="next($event)"
      />
    </template>
    <template #namespace="{ model, state }">
      <namespace-boot
        v-model="model.model"
        :state="state"
      />
    </template>
  </kube-tab>
</template>

<script>
import { get } from 'vuex-pathify';
import {
    ROLES,
} from 'kubecube/utils/constance';
import {
    toPlainObject as toTenantPlainObject,
} from 'kubecube/k8s-resources/scope/tenant';

import {
    toPlainObject as toCubeResourceQoutaPlainObject,
} from 'kubecube/k8s-resources/cubeResourceQuota/index.js';

import {
    toPlainObject as toProjectPlainObject,
} from 'kubecube/k8s-resources/scope/project';

import {
    toPlainObject as toResourceQuotaPlainObject,
} from 'kubecube/k8s-resources/resourceQuota/index.js';
import tenantBoot from './tenant-boot.vue';
import tenantQuotaBoot from './tenantquota-boot.vue';
import projectBoot from './project-boot.vue';
import memberBoot from './member-boot.vue';
import namespaceBoot from './namespace-boot.vue';

export default {
    metaInfo() {
        return {
            title: this.currentTitle,
        };
    },
    components: {
        tenantBoot,
        tenantQuotaBoot,
        projectBoot,
        memberBoot,
        namespaceBoot,
    },
    data() {
        return {
            tabs: [],
            currentTitle: '',
        };
    },

    computed: {
        userRole: get('scope/userRole'),
        globalLoading: get('scope/loading'),
        isPlatform() {
            return this.userRole[ROLES.PLATFORM_ADMIN];
        },
        isTenant() {
            return this.userRole[ROLES.TENANT_ADMIN];
        },
        isProject() {
            return this.userRole[ROLES.PROJECT_ADMIN];
        },
    },
    created() {
        const tabs = this.tabs;
        if (this.isProject || this.isTenant || this.isPlatform) {
            tabs.unshift({
                title: '创建空间',
                tab: 'namespace',
                model: {
                    resource: toResourceQuotaPlainObject(),
                    availables: {
                        cpu: 0,
                        memory: 0,
                        gpu: 0,
                    },
                    pipe: {
                        namespace: '',
                        cluster: null,
                        tenant: null,
                        project: null,
                    },
                },
            });
            tabs.unshift({
                title: '添加项目成员',
                tab: 'member',
                model: {
                    tenant: null,
                    project: null,
                    role: null,
                    user: null,
                    scope: undefined,
                },
            });
        }
        if (this.isTenant || this.isPlatform) {
            tabs.unshift({
                title: '创建项目',
                tab: 'project',
                model: {
                    model: toProjectPlainObject(),
                    projectadmin: null,
                },
            });
            tabs.unshift({
                title: '租户配额',
                tab: 'tenantquota',
                tenant: null,
                model: {
                    tenant: null,
                    cluster: null,
                    item: {},
                    used: {},
                    model: toCubeResourceQoutaPlainObject(),
                    availables: {},
                },
            });
        }
        if (this.isPlatform) {
            tabs.unshift({
                title: '创建租户',
                tab: 'tenant',
                model: {
                    model: toTenantPlainObject(),
                    tenantadmin: null,
                },
                tenantadmin: null,
            });
        }
        if (tabs.length > 0) {
            this.currentTitle = tabs[0].title;
        }
        return tabs;
    },
    methods: {
        tabChange(curTab) {
            this.currentTitle = curTab.title;
        },
        next(callback) {
            this.$refs.tab.chooseNext();
            if (callback) {
                callback(this.tabs);
            }

        },
    },
};
</script>

<style>

</style>
