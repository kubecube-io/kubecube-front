import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1/cube/proxy/clusters',
    apis: {
        getWorkloads: {
            method: 'get',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}',
        },
        createWorkload: {
            method: 'post',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}',
        },
        deleteWorkload: {
            method: 'delete',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}/{name}',
        },
        getInstance: {
            method: 'get',
            template: '/{cluster}/apis/apps/v1/namespaces/{namespace}/{resource}/{name}',
        },
        getConfigs: {
            method: 'get',
            template: '/{cluster}/api/v1/namespaces/{namespace}/{resource}',
        },
    },

});

userInterceptor(service.axiosInstance);
export default service;
