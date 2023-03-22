import Service from './service';
import { userInterceptor } from './interceptor';
// const controlCluster = 'pivot-cluster';
import store from 'kubecube/store';
// const rbac = 'rbac.authorization.k8s.io';
const service = Service({
    baseURL: `/api/v1/cube/proxy/clusters/${store.get('scope/controlClusterList')[0].clusterName}`,
    apis: {
        // getClusterRoleBindings: {
        //     template: '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
        //     method: 'get',
        // },
        getRoleBindings: {
            template: '/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/rolebindings',
            method: 'get',
        },
        createRoleBindings: {
            template: '/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/rolebindings',
            method: 'post',
        },
        deleteRoleBinding: {
            template: '/apis/rbac.authorization.k8s.io/v1/namespaces/{namespace}/rolebindings/{name}',
            method: 'delete',
        },

        createRole: {
            url: '/apis/rbac.authorization.k8s.io/v1/clusterroles',
            method: 'post',
        },
        patchRole: {
            template: '/apis/rbac.authorization.k8s.io/v1/clusterroles/{name}',
            method: 'patch',
            headers: {
                'Content-Type': 'application/strategic-merge-patch+json',
            },
        },
        // createScope: {
        //     template: '/apis/tenant.kubecube.io/v1/{scope}',
        //     method: 'post',
        // },
        // patchScope: {
        //     template: '/apis/tenant.kubecube.io/v1/{scope}/{name}',
        //     method: 'patch',
        //     headers: {
        //         'Content-Type': 'application/merge-patch+json',
        //     },
        // },
        // getScope: {
        //     template: '/apis/tenant.kubecube.io/v1/{scope}/{name}',
        //     method: 'post',
        // },
        // deleteScope: {
        //     template: '/apis/tenant.kubecube.io/v1/{scope}/{name}',
        //     method: 'delete',
        // },
    },
});

userInterceptor(service.axiosInstance);
export default service;
