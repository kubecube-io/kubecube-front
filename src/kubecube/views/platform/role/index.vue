<template>
  <div>
    <u-tabs router>
      <u-tab
        v-for="(item, index) in tabs"
        :key="index"
        :value="item"
        :title="item.title"
        :to="{ path: item.path }"
      />
    </u-tabs>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import {
    ROLES,
} from 'kubecube/utils/constance';
export default {
    metaInfo: {
        title: 'role - kubecube',
    },
    data() {
        return {
            tab: {},

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
        tabs() {
            const tabs = [
                {
                    title: '平台角色', path: '/platform/role/platform',
                },
                {
                    title: '租户角色', path: '/platform/role/tenant',
                },
                {
                    title: '项目角色', path: '/platform/role/project',
                },
            ];
            // if (this.isPlatform) {
            //     tabs.push({
            //         title: '平台角色', path: '/platform/role/platform',
            //     });
            // }
            // if (this.isTenant) {
            //     tabs.push({
            //         title: '租户角色', path: '/platform/role/tenant',
            //     });
            // }
            // if (this.isProject) {
            //     tabs.push({
            //         title: '项目角色', path: '/platform/role/project',
            //     });
            // }
            return tabs;
        },
    },
    watch: {
        '$route.path': function(val) {
            if (val.endsWith('role')) {
                this.$router.replace({ path: this.tabs[0].path });
            }
        },
    },
    mounted() {
        this.$router.replace({ path: this.tabs[0].path });
    },
};
</script>

<style>

</style>
