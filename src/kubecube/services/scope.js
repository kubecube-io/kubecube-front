import Service from './service';
import { userInterceptor } from './interceptor';
// const controlCluster = 'pivot-cluster';
import store from 'kubecube/store';
const service = Service({
    baseURL: `/api/v1/cube/proxy/clusters/${store.get('scope/controlClusterList')[0].clusterName}`,
    apis: {
        getScopeList: {
            template: '/apis/tenant.kubecube.io/v1/{scope}',
            method: 'get',
        },
        createScope: {
            template: '/apis/tenant.kubecube.io/v1/{scope}',
            method: 'post',
        },
        patchScope: {
            template: '/apis/tenant.kubecube.io/v1/{scope}/{name}',
            method: 'patch',
            headers: {
                'Content-Type': 'application/merge-patch+json',
            },
        },
        getScope: {
            template: '/apis/tenant.kubecube.io/v1/{scope}/{name}',
            method: 'post',
        },
        deleteScope: {
            template: '/apis/tenant.kubecube.io/v1/{scope}/{name}',
            method: 'delete',
        },
        createCubeQuotaResource: {
            method: 'post',
            url: '/apis/quota.kubecube.io/v1/cuberesourcequota',
        },
        getCubeQuotaResource: {
            method: 'get',
            url: '/apis/quota.kubecube.io/v1/cuberesourcequota',
        },
        getCubeQuotaResourceInstance: {
            method: 'get',
            template: '/apis/quota.kubecube.io/v1/cuberesourcequota/{name}',
            silent: true,
        },
        patchKubeDefineResource: {
            method: 'patch',
            template: '/apis/quota.kubecube.io/v1/cuberesourcequota/{name}',
            headers: {
                'Content-Type': 'application/merge-patch+json',
            },
        },
    },
});

userInterceptor(service.axiosInstance);
export default service;
