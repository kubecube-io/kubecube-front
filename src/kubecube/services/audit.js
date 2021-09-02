import Service from './service';
import { userInterceptor } from './interceptor';
const userService = Service({
    baseURL: '/api/v1/',
    apis: {
        getAudit: {
            url: '/audit',
            method: 'get',
        },
        exportAudit: {
            url: '/audit/export',
            method: 'get',
        },
        enabled: {
            url: '/audit/enabled',
            method: 'get',
        },
    },
});

userInterceptor(userService.axiosInstance);

export default userService;

