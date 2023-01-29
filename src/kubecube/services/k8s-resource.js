import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1/cube/proxy/clusters',
    apis: {
        createResourceWithoutNamespace: {
            method: 'post',
            template: '/{cluster}/api/v1/{resource}',
        },
        getResourceListWithoutNamespace: {
            method: 'get',
            template: '/{cluster}/api/v1/{resource}',
        },
        getResourceWithoutNamespace: {
            method: 'get',
            template: '/{cluster}/api/v1/{resource}/{name}',
        },
        modifyResourceWithoutNamespace: {
            method: 'patch',
            template: '/{cluster}/api/v1/{resource}/{name}',
            headers: {
                'Content-Type': 'application/strategic-merge-patch+json',
            },
        },
        updateResourceWithoutNamespace: {
            method: 'put',
            template: '/{cluster}/api/v1/{resource}/{name}',
        },
        deleteResourceWithoutNamespace: {
            method: 'delete',
            template: '/{cluster}/api/v1/{resource}/{name}',
        },
        getWorkloads: {
            method: 'get',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}',
        },
        createWorkload: {
            method: 'post',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}',
        },
        patchWorkload: {
            method: 'patch',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}/{name}',
            headers: {
                'Content-Type': 'application/strategic-merge-patch+json',
            },
        },
        modifyWorkload: {
            method: 'put',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}/{name}',
            headers: {
                'Content-Type': 'application/yaml',
            },
        },
        deleteInstance: {
            method: 'delete',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}/{name}',
        },
        getInstance: {
            method: 'get',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}/{name}',
        },
        getBatchs: {
            method: 'get',
            template: '/{cluster}/apis/batch/v1/namespaces/{namespace}/{resource}',
        },
        createBatchs: {
            method: 'post',
            template: '/{cluster}/apis/batch/v1/namespaces/{namespace}/{resource}',
        },
        getBatchsBeta: {
            method: 'get',
            template: '/{cluster}/apis/batch/v1beta1/namespaces/{namespace}/{resource}',
        },
        createBatchsBeta: {
            method: 'post',
            template: '/{cluster}/apis/batch/v1beta1/namespaces/{namespace}/{resource}',
        },
        getBatchInstance: {
            method: 'get',
            template: '/{cluster}/apis/batch/v1/namespaces/{namespace}/{resource}/{name}',
        },
        deleteBatchInstance: {
            method: 'delete',
            template: '/{cluster}/apis/batch/v1/namespaces/{namespace}/{resource}/{name}',
        },
        modifyBatchInstance: {
            method: 'put',
            template: '/{cluster}/apis/batch/v1/namespaces/{namespace}/{resource}/{name}',
        },
        getBatchsBetaInstance: {
            method: 'get',
            template: '/{cluster}/apis/batch/v1beta1/namespaces/{namespace}/{resource}/{name}',
        },
        deleteBatchsBetaInstance: {
            method: 'delete',
            template: '/{cluster}/apis/batch/v1beta1/namespaces/{namespace}/{resource}/{name}',
        },
        modifyBatchsBetaInstance: {
            method: 'put',
            template: '/{cluster}/apis/batch/v1beta1/namespaces/{namespace}/{resource}/{name}',
        },
        getAPIV1: {
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}',
        },
        getAPIV1Instance: {
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}/{name}',
        },
        createAPIV1Instance: {
            method: 'post',
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}',
        },
        patchAPIV1Instance: {
            method: 'patch',
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}/{name}',
            headers: {
                'Content-Type': 'application/strategic-merge-patch+json',
            },
        },
        modifyAPIV1Instance: {
            method: 'put',
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}/{name}',
        },
        deleteAPIV1Instance: {
            method: 'delete',
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}/{name}',
        },
        getConfigs: {
            method: 'get',
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}',
        },
        getNetworking: {
            method: 'get',
            template: '/{cluster}/apis/networking.k8s.io/v1/namespaces/{namespace}/{resource}',
        },
        getNetworkingInstance: {
            method: 'get',
            template: '/{cluster}/apis/networking.k8s.io/v1/namespaces/{namespace}/{resource}/{name}',
        },
        createNetworkingInstance: {
            method: 'post',
            template: '/{cluster}/apis/networking.k8s.io/v1/namespaces/{namespace}/{resource}',
        },
        patchNetworkingInstance: {
            method: 'patch',
            template: '/{cluster}/apis/networking.k8s.io/v1/namespaces/{namespace}/{resource}/{name}',
            headers: {
                'Content-Type': 'application/strategic-merge-patch+json',
            },
        },
        patchNetworkingJSONInstance: {
            method: 'patch',
            template: '/{cluster}/apis/networking.k8s.io/v1/namespaces/{namespace}/{resource}/{name}',
            headers: {
                'Content-Type': 'application/json-patch+json',
            },
        },
        modifyNetworkingInstance: {
            method: 'put',
            template: '/{cluster}/apis/networking.k8s.io/v1/namespaces/{namespace}/{resource}/{name}',
        },
        deleteNetworkingInstance: {
            method: 'delete',
            template: '/{cluster}/apis/networking.k8s.io/v1/namespaces/{namespace}/{resource}/{name}',
        },
        createStorage: {
            method: 'post',
            template: '/{cluster}/apis/storage.k8s.io/v1/{resource}',
        },
        getStorage: {
            method: 'get',
            template: '/{cluster}/apis/storage.k8s.io/v1/{resource}',
        },
        deleteStorage: {
            method: 'delete',
            template: '/{cluster}/apis/storage.k8s.io/v1/{resource}/{name}',
        },

        getCRD: {
            method: 'get',
            template: '/{cluster}/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
        },
        createCRD: {
            method: 'post',
            template: '/{cluster}/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
        },
        getCRDInstance: {
            method: 'get',
            template: '/{cluster}/apis/apiextensions.k8s.io/v1/customresourcedefinitions/{name}',
        },
        modifyCRDInstance: {
            method: 'put',
            template: '/{cluster}/apis/apiextensions.k8s.io/v1/customresourcedefinitions/{name}',
        },
        deleteCRDInstance: {
            method: 'delete',
            template: '/{cluster}/apis/apiextensions.k8s.io/v1/customresourcedefinitions/{name}',
        },

        getNeteaseResource: {
            method: 'get',
            template: '/{cluster}/apis/netease.com/v1/namespaces/{namespace}/{resource}',
        },
        getNeteaseResourceInstance: {
            method: 'get',
            template: '/{cluster}/apis/netease.com/v1/namespaces/{namespace}/{resource}/{name}',
        },
        createNeteaseResource: {
            method: 'post',
            template: '/{cluster}/apis/netease.com/v1/namespaces/{namespace}/{resource}',
        },
        modifyNeteaseResource: {
            method: 'put',
            template: '/{cluster}/apis/netease.com/v1/namespaces/{namespace}/{resource}/{name}',
        },
        patchNeteaseResourceInstance: {
            method: 'patch',
            template: '/{cluster}/apis/netease.com/v1/namespaces/{namespace}/{resource}/{name}',
            headers: {
                'Content-Type': 'application/strategic-merge-patch+json',
            },
        },
        deleteNeteaseResource: {
            method: 'delete',
            template: '/{cluster}/apis/netease.com/v1/namespaces/{namespace}/{resource}/{name}',
        },

        getClusterCRResource: {
            method: 'get',
            template: '/{cluster}/apis/{group}/{version}/{plural}',
        },
        createClusterCRResource: {
            method: 'post',
            template: '/{cluster}/apis/{group}/{version}/{plural}',
        },
        getClusterCRResourceInstance: {
            method: 'get',
            template: '/{cluster}/apis/{group}/{version}/{plural}/{name}',
        },
        patchClusterCRResourceInstance: {
            method: 'patch',
            template: '/{cluster}/apis/{group}/{version}/{plural}/{name}',
            headers: {
                'Content-Type': 'application/merge-patch+json',
            },
        },
        modifyClusterCRResource: {
            method: 'put',
            template: '/{cluster}/apis/{group}/{version}/{plural}/{name}',
        },
        deleteClusterCRResource: {
            method: 'delete',
            template: '/{cluster}/apis/{group}/{version}/{plural}/{name}',
        },
        getNamespaceCRResource: {
            method: 'get',
            template: '/{cluster}/apis/{group}/{version}/namespaces/{namespace}/{plural}',
        },
        createNamespaceCRResource: {
            method: 'post',
            template: '/{cluster}/apis/{group}/{version}/namespaces/{namespace}/{plural}',
        },
        getNamespaceCRResourceInstance: {
            method: 'get',
            template: '/{cluster}/apis/{group}/{version}/namespaces/{namespace}/{plural}/{name}',
        },
        patchNamespaceCRResourceInstance: {
            method: 'patch',
            template: '/{cluster}/apis/{group}/{version}/namespaces/{namespace}/{plural}/{name}',
            headers: {
                'Content-Type': 'application/merge-patch+json',
            },
        },
        modifyNamespaceCRResource: {
            method: 'put',
            template: '/{cluster}/apis/{group}/{version}/namespaces/{namespace}/{plural}/{name}',
        },
        deleteNamespaceCRResource: {
            method: 'delete',
            template: '/{cluster}/apis/{group}/{version}/namespaces/{namespace}/{plural}/{name}',
        },

        getClusterNetworking: {
            method: 'get',
            template: '/{cluster}/apis/networking.k8s.io/v1/{resource}',
        },
        getClusterNetworkingInstance: {
            method: 'get',
            template: '/{cluster}/apis/networking.k8s.io/v1/{resource}/{name}',
        },

        eviction: {
            method: 'post',
            template: '/{cluster}/api/v1/namespaces/{namespace}/pods/{name}/eviction',
        },
    },

});

userInterceptor(service.axiosInstance);
export default service;
