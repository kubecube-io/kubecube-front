import Service from './service.js';
import { normalizeConfigMap, normalizeSecret, normalizeService } from '@micro-app/common/views/ncs/utils';

const harborapis = {
    // type - 类型，1公有2私有3全部
    loadImages: {
        path: '/{clusterId}/projects/getImageLists',
        method: 'get',
        process: (result = {}) => ({
            list: result.repositories || [],
            total: result.total || 0,
            harbor: result.harbor || '',
        }),
    },
    // 获取镜像列表
    loadRepoTags: {
        path: '/{clusterId}/repositories/getRepoTags',
        method: 'get',
    },
};
const ncsapis = {
    loadSecrets: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/secrets',
        process: (result) =>
            // 不暴露kubernetes.io/service-account-token这种类型的secret
            (result.items || [])
                .filter((item) => item.type !== 'kubernetes.io/service-account-token')
                .map((item) => normalizeSecret(item))
        ,
    },
    loadConfigMap: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/configmaps',
        process: (result) => (result.items || []).map((item) => normalizeConfigMap(item)),
    },
    loadServices: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services',
        process: (result) => {
            return {
                total: result.total || 0,
                list: (result.services || []).map((item) => normalizeService(item)),
            };
        },
    },
    loadAllInfo: {
        method: 'get',
        path: '/extends/monitor/query',
        process: (result) => result.data,
    },
};

const clusterapis = {
    // 新增了管控集群，之前调用集群列表的地方大多数不能展示管控集群，所以对该方法的返回做一次筛选
    loadSimple: {
        method: 'get',
        path: '/clusters/prune',
        process: (result = {}) => {
            const clusterInfoList = result.clusterInfoList || [];
            return {
                clusterInfoList: clusterInfoList.filter((item) => !item.isControlCluster)
            };
        },
    },
    loadSimpleAll: {
        method: 'get',
        path: '/clusters/prune',
    },
};

const harbor = new Service(harborapis, '/repo/proxy/api/v1/harborproxy');
const ncs = new Service(ncsapis, '/ncs/proxy/api/v1/ncs');
const cluster = new Service(clusterapis, '/ncs/proxy/api/v1/ncs/extends');
const service = Object.assign(harbor, ncs, cluster);
export default service;
