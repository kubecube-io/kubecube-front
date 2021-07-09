import Service from '@micro-app/common/services/service.js';
const apis = {
    loadStatus: {
        method: 'get',
        path: '/{clusterName}/pod/{nsName}/{podName}/shell/{containerName}',
        headers: {
            'Content-Type': 'application/json',
        },
    },
};

const service = new Service(apis, 'webconsole/api/v1');

export default service;
