import config from '@micro-app/common/utils/config';
export default {
    name: 'u-unauth',
    docTitle: '无权限',
    data() {
        return {
            config,
            headLoaded: true,
            PlatformPermission: {}, // 平台权限
            domains: '',
        };
    },
    computed: {
        notFound() {
            return this.$route.meta && this.$route.meta.notFound;
        },
        withHead() {
            return this.$route.meta && this.$route.meta.withHead;
        },
        unAuthText() {
            return this.$route.meta && this.$route.meta.unAuthText;
        },
        platformPermissionPromise() {
            return this.$route.meta && this.$route.meta.platformPermission;
        },
        platformUrl() {
            if (!this.domains)
                return;
            const port = window.location.port ? ':' + window.location.port : '';
            return window.location.protocol + '//' + this.domains.platform.replace(/(?=\/)|$/, port) + `/#/permission/tenantManage/initialization?tenantId=${this.tenantId}`;
        },
        tenantId() {
            return this.$route.query.tenantId || localStorage.getItem('tenantId') || '';
        },
    },
    watch: {
        $route(route) {
            const { projectId, tenantId } = route.query;
            if (projectId)
                this.$router.replace('/');
            else if (tenantId)
                this.$router.replace('/noProject');
        },
    },
    created() {
        if (this.platformPermissionPromise) {
            this.platformPermissionPromise.then((res) => {
                this.PlatformPermission = res;
            });
        }
        if (this.config) {
            this.config.getDomains().then((res) => {
                this.domains = res;
            });
        }
    },
};
