import request from '@micro-app/common/services/request';
const prefix = '/ncs/proxy/api/v1/ncs';
export default {
    /**
     * 节点
     */

    // 获取节点列表
    listNode: ({ id, body }) => request.get(`${prefix}/clusters/${id}/nodes`, body),

    // 获取节点详情
    getNode: ({ id, name }) => request.get(`${prefix}/clusters/${id}/nodes/${name}`),

    // 添加节点
    addNode: ({ id, body }) => request.post(`${prefix}/extends/clusters/${id}/nodes/initNode`, body),

    // 更新节点
    updateNode: ({ id, name, body }) => request.put(`${prefix}/clusters/${id}/nodes/${name}`, body),

    // 获取某个集群下的所有事件
    listEvents: ({ id, body }) => request.get(`${prefix}/extends/clusters/${id}/events`, body),

    /**
     * 集群
     */

    // 获取集群列表
    listCluster: () => request.get(`${prefix}/extends/clusters`),

    // 获取集群详情
    getCluster: ({ id }) => request.get(`${prefix}/extends/clusters/${id}`),

    /**
     * 命名空间
     */

    // 获取空间列表
    listNameSpace: ({ id, body }) => request.get(`${prefix}/clusters/${id}/namespaces`, body),

    // 创建空间
    createNameSpace: ({ id, body }) => request.post(`${prefix}/clusters/${id}/namespaces`, body),

    // 更新空间
    updateNameSpace: ({ id, nsName, body }) => request.put(`${prefix}/clusters/${id}/namespaces/${nsName}`, body),

    // 删除空间
    deleteNameSpace: ({ id, nsName }) => request.delete(`${prefix}/clusters/${id}/namespaces/${nsName}`),

    // 创建配额
    createResourceQuota: ({ id, nsName, body }) => request.post(`${prefix}/clusters/${id}/namespaces/${nsName}/resourcequotas`, body),

    // 更新配额
    updateResourceQuota: ({ id, nsName, name, body }) => request.put(`${prefix}/clusters/${id}/namespaces/${nsName}/resourcequotas/${name}`, body),

    // 获取空间各配额
    loadNSQuota: ({ id, nsName, name }) => request.get(`${prefix}/clusters/${id}/namespaces/${nsName}/resourcequotas/${name}`),
};
