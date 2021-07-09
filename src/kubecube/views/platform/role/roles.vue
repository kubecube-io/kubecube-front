<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout direction="horizontal">
      <u-button
        icon="create"
        color="primary"
        :disabled="!isPlatform"
        @click="addRole"
      >
        添加角色
      </u-button>
    </u-linear-layout>

    <x-request
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ loading }">
        <div :class="$style.wrapper">
          <u-loading v-if="loading" />
          <template v-else>
            <div :class="$style.nav">
              <u-button
                v-for="name in identityNames"
                :key="name"
                :class="$style.navbtn"
                :color="name === curIdent.metadata.name ? 'primary' : 'normal' "
                @click="choose(name)"
              >
                {{ name }}
              </u-button>
            </div>
            <div :class="$style.content">
              <kube-tree
                v-model="curIdent.rules"
                :disabled="!isPlatform || curIdent.metadata.name === `${identity}-admin`"
                title="资源权限"
              />
            </div>
            <u-button
              color="primary"
              :class="$style.modifyBtn"
              :disabled="!isPlatform || curIdent.metadata.name === `${identity}-admin`"
              @click="modifyRole"
            >
              修改
            </u-button>
          </template>
        </div>
      </template>
    </x-request>
    <role-dialog
      ref="roleDialog"
      @refresh="refresh"
    />
  </u-linear-layout>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import roleService from 'kubecube/services/role-binding';
import {
    toPlainObject as toRolePlainObject,
    patchK8SObject as patchRoleK8SObject,
} from 'kubecube/k8s-resources/role';
import {
    setValueIfListNotPresent,
} from 'kubecube/utils/functional';
import roleDialog from './role-dialog.vue';
import {
    ROLES,
} from 'kubecube/utils/constance';
export default {
    components: {
        roleDialog,
    },
    data() {
        return {
            service: userService.getAuthRole,
            identities: [],
            curIdent: null,
        };
    },
    computed: {
        userRole: get('scope/userRole'),
        globalLoading: get('scope/loading'),
        isPlatform() {
            return this.userRole[ROLES.PLATFORM_ADMIN];
        },
        identity() {
            return this.$route.params.identity;
        },
        params() {
            return {
                params: {
                    level: this.identity,
                },
            };
        },
        identityNames() {
            return this.identities.map(i => i.metadata.name);
        },
    },
    methods: {
        resolver(response) {
            const data = (response.items || []);
            data.sort(a => (a.metadata.name === 'platform-admin' ? -1 : 0));
            const template = toRolePlainObject(getFunc(data, '[0]'), true);
            this.identities = [ template, ...data.slice(1).map(d => toRolePlainObject(d, template.rules)) ];
            setValueIfListNotPresent({
                list: this.identities,
                path: 'metadata.name',
                current: getFunc(this.curIdent, 'metadata.name'),
            }, val => {
                this.curIdent = val;
            });
            return true;
        },
        refresh() {
            this.$refs.request.request();
        },
        choose(name) {
            this.curIdent = this.identities.find(i => i.metadata.name === name);
        },
        addRole() {
            this.$refs.roleDialog.open();
        },
        async modifyRole() {
            await roleService.patchRole({
                pathParams: {
                    name: this.curIdent.metadata.name,
                },
                data: patchRoleK8SObject(this.curIdent),
            });
            this.refresh();
        },
    },
};
</script>

<style module>
.wrapper{
    position: relative;
    height: calc(100vh - 275px);
    display: flex;
    flex-direction: row;
    border: 1px solid #e1e8ed;
}
.nav{
    width: 190px;
    height: 100%;
    overflow: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    border-right: 1px solid #e1e8ed;
    padding: 10px;
}
.navbtn{
    width: 160px;
}
.navbtn + .navbtn{
    margin-top: 5px;
}
.content{
    position: relative;
    flex: 1;
    height: 100%;
    overflow: scroll;
    padding: 10px;
}
.modifyBtn{
    position: absolute;
    right: 20px;
    top: 20px;
}
</style>
