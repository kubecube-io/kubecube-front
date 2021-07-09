import Service from '@micro-app/common/services/service.js';

const apis = {
    getPvcList: {
        path: '/extends/clusters/{clusterId}/storage/namespaces/{namespace}/persistentvolumeclaims',
        method: 'get',
    },
    createPvc: {
        path: '/clusters/{clusterId}/namespaces/{namespace}/persistentvolumeclaims',
        method: 'post',
    },
    deletePvc: {
        path: '/clusters/{clusterId}/namespaces/{namespace}/persistentvolumeclaims/{name}',
        method: 'delete',
    },
    checkPvc: {
        path: '/clusters/{clusterId}/namespaces/{namespace}/persistentvolumeclaims/{name}',
        method: 'get',
    },
    // 废弃
    // getStorageClassList: {
    //     path: '/extends/clusters/{clusterId}/storage/storageclasses',
    //     method: 'get',
    // },
    // createStorageClass: {
    //     path: '/storage/clusters/{clusterId}/storageclasses',
    //     method: 'post',
    // },
    // deleteStorageClass: {
    //     path: '/storage/clusters/{clusterId}/storageclasses/{storageClassName}',
    //     method: 'delete',
    // },
    // checkStorageClass: {
    //     path: '/storage/clusters/{clusterId}/storageclasses/{storageClassName}',
    //     method: 'get',
    // },
    loadPV: {
        path: '/clusters/{clusterId}/persistentvolumes/{name}',
        method: 'get',
    },
    getPvList: {
        path: '/extends/clusters/{clusterId}/storage/persistentvolumes',
        method: 'get',
    },
    updatePv: {
        path: '/clusters/{clusterId}/persistentvolumes/{name}',
        method: 'put',
    },
    deletePv: {
        path: '/clusters/{clusterId}/persistentvolumes/{name}',
        method: 'delete',
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs');
export default service;
