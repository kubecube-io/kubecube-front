// import axios from 'axios';
// import { userInterceptor } from './interceptor';

// const clusterService = axios.create({
//     baseURL: '/api/v1/cube/clusters',
//     timeout: 10000,
// });
// userInterceptor(clusterService);
// export async function getClusters(){
//     return await clusterService.request({
//         url: '/info',
//         method: 'get',
//     });
// }

import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1/cube/clusters',
    apis: {
        getClusters: {
            method: 'get',
            url: '/info',
        },
    },
});

userInterceptor(service.axiosInstance);
export default service;
