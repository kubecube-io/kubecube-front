<template>
  <div :class="$style.root">
    <aside :class="['g-side', $style.nav]">
      <div class="g-sidebar">
        <u-sidebar collapsible>
          <u-sidebar-header
            label="运维管理"
          />

          <u-sidebar-group
            class="m-sidebar-group"
          >
            <span slot="title"><u-icons name="member" />组织管理</span>
            <u-sidebar-item
              v-if="isPlatform"
              :to="{ path: '/platform/user' }"
            >
              用户管理
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/role' }">
              角色管理
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/bootstrap' }">
              快速向导
            </u-sidebar-item>
            <u-sidebar-item
              v-if="isPlatform || isTenant"
              :to="{ path: '/platform/tenant' }"
            >
              租户管理
            </u-sidebar-item>
            <u-sidebar-item
              v-if="(isTenant || isProject) && !isPlatform"
              :to="{ path: '/platform/tenant/project' }"
            >
              项目管理
            </u-sidebar-item>
          </u-sidebar-group>
          <u-sidebar-group
            class="m-sidebar-group"
          >
            <span slot="title"><u-icons name="ncs" />资源管理</span>
            <u-sidebar-item
              v-if="isPlatform"
              :to="{ path: '/platform/quota' }"
            >
              租户配额
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/cluster' }">
              集群管理
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/nsquota' }">
              空间管理
            </u-sidebar-item>
          </u-sidebar-group>
          <u-sidebar-group
            v-if="isPlatform"
            class="m-sidebar-group"
          >
            <span slot="title"><u-icons name="cluster" />管控运维</span>
            <!-- <u-sidebar-item>
              组件监控
            </u-sidebar-item>
            <u-sidebar-item>
              组件告警
            </u-sidebar-item>
            <u-sidebar-item>
              组件日志
            </u-sidebar-item> -->
            <u-sidebar-item :to="{ path: '/platform/audit' }">
              操作审计
            </u-sidebar-item>
          </u-sidebar-group>
        </u-sidebar>
      </div>
    </aside>
    <div :class="$style.container">
      <div :class="$style.content">
        <u-app-bread-crumbs relative="platform" />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import uAppBreadCrumbs from 'kubecube/component/global/u-app-bread-cumbs.vue';
import {
    ROLES,
} from 'kubecube/utils/constance';

export default {
    metaInfo: {
        title: '运维管理 - kubecube',
    },

    components: {
        uAppBreadCrumbs,
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
    watch: {
        globalLoading(val) {
            console.log(val);
        },
    },
    mounted() {
        if (this.$route.path === '/platform') {
            this.$router.replace({
                path: this.isPlatform ? '/platform/user' : '/platform/role',
            });
        }

    },
};
</script>

<style module>
.root{
    height: 100%;
}
.container{
    position: absolute;
    top: 64px;
    left: 180px;
    right: 0;
    bottom: 0;
    overflow: auto;
    background-color: #fff;
}
.content{
    padding: 40px;
    min-width: 1170px;
}
.full{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav{
    left: 0px;
    top: 64px;
    width: 180px;
    height: 100%;
}
.nav > div {
    position: relative;
    width: 100%;
    height: 100%;
}
.subTitle {
    margin: 10px 0 -5px 20px;
}
</style>
