import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1/cube/extend/clusters',
    apis: {
        getWorkloads: {
            method: 'get',
            template: '/{cluster}/namespaces/{namespace}/{resource}',
        },
        getPVCPods: {
            method: 'get',
            template: '/{cluster}/namespaces/{namespace}/pvcworkloads/{pvcName}',
        },
        getInstance: {
            method: 'get',
            template: '/{cluster}/namespaces/{namespace}/{resource}/{name}',
        },
        getExternalAddress: {
            method: 'get',
            template: '/{cluster}/namespaces/{namespace}/externalAccessAddress',
        },
        getExternalAddressInService: {
            method: 'get',
            template: '/{cluster}/namespaces/{namespace}/externalAccess/{name}',
        },
        setExternalAddressInService: {
            method: 'post',
            template: '/{cluster}/namespaces/{namespace}/externalAccess/{name}',
        },
        deploy: {
            method: 'post',
            template: '/{cluster}/yaml/deploy',
        },
        getlog: {
            method: 'get',
            template: '/{cluster}/namespaces/{namespace}/logs/{pod}',
        },
    },

});

userInterceptor(service.axiosInstance);
export default service;
