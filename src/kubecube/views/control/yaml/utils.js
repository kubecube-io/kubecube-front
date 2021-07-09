export const getAPIKeyWork = config => {
    if (config.resource) {
        return 'APIV1';
    }
    return 'NamespaceCRResource';
};
export const configs = {
    Deployment: {
        group: 'apps',
        version: 'v1',
        plural: 'deployments',
    },
    StatefulSet: {
        group: 'apps',
        version: 'v1',
        plural: 'statefulsets',
    },
    Deamonset: {
        group: 'apps',
        version: 'v1',
        plural: 'daemonsets',
    },
    CronJob: {
        group: 'batch',
        version: 'v1beta1',
        plural: 'cronjobs',
    },
    Job: {
        group: 'batch',
        version: 'v1',
        plural: 'jobs',
    },
    Service: {
        resource: 'services',
    },
    Ingress: {
        group: 'networking.k8s.io',
        version: 'v1',
        plural: 'ingresses',
    },
    ConfigMap: {
        resource: 'configmaps',
    },
    Secret: {
        resource: 'secrets',
    },
    PersistentVolumeClaim: {
        resource: 'persistentvolumeclaims',
    },
};
