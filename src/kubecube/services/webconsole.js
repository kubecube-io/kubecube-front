import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1/webconsole',
    apis: {
        connect: {
            method: 'get',
            template: '/{cluster}/namespace/{namespace}/pod/{pod}/shell/{container}',
        },
        connectCloudShell: {
            method: 'get',
            template: '/extends/cloudShell/clusters/{cluster}',
        },
    },
});

userInterceptor(service.axiosInstance);
export default service;
