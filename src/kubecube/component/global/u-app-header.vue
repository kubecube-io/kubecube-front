<template>
  <div :class="$style.head">
    <span
      :class="$style.logo"
      @click="toIndex"
    >
      <a :class="$style.logo_icon" />
      <span :class="$style.logo_title">KubeCube</span>

    </span>
    <template v-if="!isInLogin">
      <template v-if="isInControl">
        <div
          :class="$style.selects"
        >
          <u-app-tenant-select />
          <u-app-project-select />
        </div>
      </template>
      <div :class="$style.middle">
        <slot name="middle" />
      </div>
      <div :class="$style.right">
        <div v-if="hasRight">
          <u-button
            :class="$style.headerButton"
            @click="() => isInPlatform ? toControl() : toPlatform()"
          >
            切换到{{ isInPlatform ? '控制台' : '运维管理' }}
          </u-button>
        </div>
        <div>
          <u-popper-select :popper-style="{ maxHeight: 'none' }">
            <template slot="title">
              <i :class="$style.portrait" />
              <span
                :class="$style.name"
                :title="name"
              >{{ name.AccountDisplayName }}</span>
            </template>
            <div slot="popper">
              <!-- <li @click="showAddUserInfo = true">
                    <i-line-awesome name="user" style="font-size: 16px; vertical-align: -3px; margin-right: 8px;"></i-line-awesome>个人信息
                </li> -->
              <li @click="toUser">
                <i-line-awesome
                  name="key"
                  style="font-size: 16px; vertical-align: -3px; margin-right: 8px;"
                />密钥管理
              </li>
              <li
                id="logout"
                :class="$style.login"
                @click="logout"
              >
                <i-line-awesome
                  name="sign-out"
                  style="font-size: 16px; vertical-align: -3px; margin-right: 5px; margin-left: -1px;"
                /> 安全退出
              </li>
            </div>
          </u-popper-select>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import uAppTenantSelect from './header/u-app-tenant-select.vue';
import uAppProjectSelect from './header/u-app-project-select.vue';
import { removeItem } from 'kubecube/utils/persistant';
import {
    ROLES,
} from 'kubecube/utils/constance';
export default {
    components: {
        uAppTenantSelect,
        uAppProjectSelect,
    },
    props: {
        roleLoading: Boolean,
    },
    computed: {
        tenant: sync('scope/tenant@value'),
        project: sync('scope/project@value'),
        name: get('scope/user'),
        userRole: get('scope/userRole'),
        isInPlatform() {
            return this.$route.path.startsWith('/platform');
        },
        isInControl() {
            return this.$route.path.startsWith('/control') || this.$route.path.startsWith('/namespace');
        },
        isInLogin() {
            return this.$route.path.startsWith('/login');
        },
        // isInUser() {
        //     return this.$route.path.startsWith
        // },
        hasRight() {
            const roles = this.userRole || {};
            return roles[ROLES.PLATFORM_ADMIN] || roles[ROLES.TENANT_ADMIN] || roles[ROLES.PROJECT_ADMIN];
        },
    },
    methods: {
        toIndex() {
            if (this.$route.path.startsWith('/control') || this.$route.path.startsWith('/namespace')) {
                this.$router.push('/namespace');
            } else {
                this.$router.push('/platform/user/list');
            }
        },
        toPlatform() {
            this.$router.push('/platform');
        },
        toControl() {
            console.log('go control');
            this.$router.push('/namespace');
        },
        toUser() {
            this.$router.push('/metauser');
        },
        logout() {
            removeItem('user');
            this.$store.dispatch('scope/resetState');
            this.$router.push('/login');
        },
    },
};
</script>

<style module>
.head{
    width: 100%;
    min-width: 1280px;
    height: $navbar-height;
    margin: 0 auto;
    background-color: #183054;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 6px 0 rgba(0,0,0,.15);
    position: fixed;
    top: 0;
    z-index: 1000;
}
.selects {
    display: inline-block;
    vertical-align: top;
}
.cont > nav{
    margin: 0 10px;
}
.logo{
    margin-left: 10px;
    margin-right: 50px;
    display: inline-block;
    height: $navbar-height;
}
.logo:hover{
    cursor: pointer;
}
.logo > .image {
    height: 64px;
    object-fit: contain;
}
.logo_icon{
    display: inline-block;
    width: 40px;
    height: 64px;
    background: url(./icon/logo.png) no-repeat 100%/100%;
}
.logo_title{
    display: inline-block;
    color: #fff;
    font-size: 20px;
    height: $navbar-height;
    line-height: $navbar-height;
    vertical-align: top;
    padding-left: 10px;
}
.middle{
    display: inline-block;
    margin: 0 20px;
    vertical-align: top;
    line-height: $navbar-height;
}
.portrait{
    display: inline-block;
    height: 40px;
    width: 40px;
    background: url(./icon/portrait.svg);
    vertical-align: middle;
}
.right {
    float: right;
}

.right > * {
    float: left;
}
.name{
    position: relative;
    padding:0 10px;
    display: inline-block;
    vertical-align: middle;
    line-height: 2;
    max-width: 96px;
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 14px;
}
.head::after {
    display: block;
    content: '';
    clear: both;
}
.login{
    padding-left: 24px !important;
}
.port_icon, .platform_icon, .tenant_icon, .project_icon {
    margin-right: 10px;
    /* margin-left: 4px; */
    vertical-align: middle;
}
.port_icon:after{
    icon-font: url('./icon/logout.svg');
}

.tenant_icon:after{
    icon-font: url('./icon/tenant.svg');
}
.project_icon:after{
    icon-font: url('./icon/project.svg');
}

.headerButton[class] {
    display: inline-block;
    line-height: 64px;
    height: 100%;
    border: none;
    background: transparent;
    color: #fff;
    border-radius: 0;
}
.headerButton[class]:hover {
    color: white;
    background-color: #142948;
    text-decoration: none;
}
</style>
