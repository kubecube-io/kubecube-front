import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1/cube/proxy/clusters',
    apis: {
        getNamespaces: {
            template: '/{cluster}/api/v1/namespaces',
            method: 'get',
        },
        getNamespaceInstance: {
            template: '/{cluster}/api/v1/namespaces/{name}',
            method: 'get',
        },
        updatetNamespaceInstance: {
            template: '/{cluster}/api/v1/namespaces/{name}',
            method: 'put',
        },
    },
});

userInterceptor(service.axiosInstance);
export default service;
