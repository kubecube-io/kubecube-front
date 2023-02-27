<template>
  <div :class="$style.container">
    <u-app-header :role-loading="roleLoading" />
    <div
      v-if="roleLoading"
      :class="$style.full"
    >
      <u-loading
        size="huge"
      />
    </div>
    <router-view v-else-if="controlClusterList && controlClusterList.length" />
    <u-confirm ref="confirm" />
    <kube-yaml-dialog ref="kubeyaml" />
    <global-error-modal ref="globalErrorModal" />
  </div>
</template>

<script>
import Vue from 'vue';
import { pick } from 'lodash';
import { get, sync } from 'vuex-pathify';
import userService from 'kubecube/services/user';
import pipeMixin from 'kubecube/mixins/pipe/pipe.mixin';
import UAppHeader from './component/global/u-app-header.vue';
import kubeYamlDialog from 'kubecube/component/global/common/kube-yaml-dialog.vue';
import platfromRoutes from 'kubecube/router/platform';
import ControlRoutes from 'kubecube/router/control';
import OpenAPIRoutes from 'kubecube/router/user';
import ControlNamespaceRoutes from 'kubecube/router/control-namespace';
import globalErrorModal from 'kubecube/component/global/global-error-modal/index.vue';
import clusterService from 'kubecube/services/cluster';
import {
    ROLES,
} from 'kubecube/utils/constance';
export default {
    components: {
        UAppHeader,
        kubeYamlDialog,
        globalErrorModal,
    },
    extends: pipeMixin,
    metaInfo: {
        title: 'kubecube',
    },

    data() {
        return {
            graph: 'tenant > project > [cluster,clustersingle] > [namespace,namespacepanel]',
            roleLoading: false,
        };
    },
    computed: {
        controlClusterList: sync('scope/controlClusterList'),
        globalLoading: sync('scope/loading'),
        user: get('scope/user'),
        userRole: sync('scope/userRole'),
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        cluster: get('scope/cluster@value'),
        namespace: get('scope/namespace@value'),
        redirectMannul: get('scope/redirectMannul'),
    },
    watch: {
        user() {
            this.resolveRouter();
        },
        '$route.path': function(val, oldval) {
            console.log(val, oldval);
            if (val.startsWith('/control')
            && !oldval.startsWith('/control')) {
                this.$nextTick(() => {
                    console.log('redirect to /contorl');
                    this.pipeRequest();
                });
            }

            if (val.startsWith('/namespace')
            && !oldval.startsWith('/namespace')) {
                this.$nextTick(() => {
                    console.log('redirect to /namespace');
                    this.pipeRequest();
                });
            }
        },
        globalLoading(val) {
            if (!val
                && this.$route.path.startsWith('/control')
                && this.cluster) {
                if (this.namespace) {
                    this.replaceToControlQuery();
                } else {
                    this.$router.push({
                        path: '/namespace',
                        query: {
                            tenant: this.tenant,
                            project: this.project,
                            cluster: this.cluster,
                        },
                    });
                }

            }
        },
        namespace(val) {
            if (val && this.$route.path.startsWith('/control')) {
                this.replaceToControlQuery();
            }
        },
    },
    created() {
        try {
            this.resolveRouter();
        } catch (error) {
            this.roleLoading = false;
        }
        this.$store.dispatch('feature/loadFeature');
        this.loadControlClusterInfo();
    },
    mounted() {
        this.$on('pipestatechange', val => {
            this.globalLoading = val;
        });
        Vue.$confirm = Vue.prototype.$confirm = this.$refs.confirm.open.bind(this.$refs.confirm);
        Vue.$editResource = Vue.prototype.$editResource = this.$refs.kubeyaml.open.bind(this.$refs.kubeyaml);
        Vue.$globalErrorModal = Vue.prototype.$globalErrorModal = this.$refs.globalErrorModal.open.bind(this.$refs.globalErrorModal);
    },
    methods: {
        async loadControlClusterInfo() {
            const response = await clusterService.getClusters({
                params: {
                    prune: true,
                },
            });
            this.controlClusterList = response.items.filter(item => !item.isMemberCluster);
        },
        replaceToControlQuery() {
            const query = pick(this.$route.query, [
                'tenant',
                'project',
                'cluster',
                'namespace',
            ]);
            const nextQ = {
                tenant: this.tenant,
                project: this.project,
                cluster: this.cluster,
                namespace: this.namespace,
            };
            if (!this.redirectMannul && JSON.stringify(query) !== JSON.stringify(nextQ)) {
                this.$router.replace({
                    query: nextQ,
                }, 'origin');
            }
        },
        async resolveRouter() {
            console.log('resolveRouter');
            if (!this.user) return;
            this.roleLoading = true;
            const roles = await userService.getUserIdenties({
                params: {
                    user: this.user.AccountId,
                },
            });
            console.log(roles);
            this.userRole = roles;
            // const rights = roles.clusterRoles.items;
            // console.log(this.$router);

            this.$router.addRoute('top', OpenAPIRoutes);
            this.$router.addRoute('top', ControlNamespaceRoutes);
            this.$router.addRoute('top', ControlRoutes);


            let nextRoute;
            if (roles[ROLES.PLATFORM_ADMIN]
            || roles[ROLES.TENANT_ADMIN]
            || roles[ROLES.PROJECT_ADMIN]) {
                this.$router.addRoute('top', platfromRoutes);
                nextRoute = '/platform';
            } else {
                nextRoute = '/control';
            }

            const resolved = this.$router.resolve(this.$route.path).resolved;
            // console.log(resolved);
            const matchedEnd = resolved.matched[resolved.matched.length - 1];
            // console.log(matchedEnd)
            if (matchedEnd.name === 'top') {
                this.$router.replace({
                    path: nextRoute,
                });
            }
            this.roleLoading = false;
            this.$nextTick(() => {
                this.pipeRequest();
            });

        },
    },
};
</script>

<style module>
.container {
    padding-top: 64px;
    width: 100vw;
    height: 100vh;
}
</style>
