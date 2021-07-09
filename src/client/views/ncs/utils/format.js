// 处理自定制的storageClass
export const formatStorageClass = (model = {}) => {
    return {
        // todo
        k8sModel: model.item,
    };
};