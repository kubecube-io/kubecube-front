<template>
    <div>
        <el-tabs :value="activeInfo.tab" page="main" @tab-click="(pane) => handleTabClick(pane, tabs)">
            <el-tab-pane
                v-for="(item, index) in tabs"
                :label="item.title"
                :key="index"
                :name="item.tab"
            />
        </el-tabs>
        <tenantBoot
            v-if="activeInfo.tab === 'tenant'"
            v-model="activeInfo.model"
            @next="next($event)"
        />
        <tenantQuotaBoot
            v-if="activeInfo.tab === 'tenantquota'"
            v-model="activeInfo.model"
            @next="next()"
        />
        <project-boot
            v-if="activeInfo.tab === 'project'"
            v-model="activeInfo.model"
            @next="next($event)"
        />
        <member-boot
            v-if="activeInfo.tab === 'member'"
            v-model="activeInfo.model"
            @next="next($event)"
        />
        <namespace-boot
            v-if="activeInfo.tab === 'namespace'"
            v-model="activeInfo.model"
        />
  </div>
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
            activeTab: '',
            activeInfo: {},
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
                        limitsCpu: 0,
                        memory: 0,
                        limitsMemory: 0,
                        gpu: 0,
                        storage: 0,
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
            this.activeInfo = tabs[0];
        }
        return tabs;
    },
    methods: {
        handleTabClick(pane, tabs) {
            const target = tabs.find(item => item.tab === pane.name);
            this.currentTitle = target.title;
            this.activeInfo = target;
        },
        tabChange(curTab) {
            this.currentTitle = curTab.title;
        },
        next(callback) {
            let index = 0;
            this.tabs.forEach((item, i) => {
                if (item.tab === this.activeInfo.tab) {
                    index = i;
                }
            });
            if (this.tabs[index + 1]) {
                this.activeInfo = this.tabs[index + 1];
            }
            if (callback) {
                callback(this.tabs);
            }

        },
    },
};
</script>

<style>

</style>
