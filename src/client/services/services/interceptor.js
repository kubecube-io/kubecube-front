import Vue from 'vue';
import { removeItem } from '@/utils/persistant';
import router from '@/router';
import { get } from 'lodash';

export function userInterceptor(instance) {

    instance.interceptors.response.use(function(response) {
        // const { code, message } = error.response.data;
        // console.log(response)
        const { status, headers } = response;
        if (status === 200) {
            if (headers['content-type'].startsWith('application/json')) {
                return response.data;
            }
            return response;
        }
        return response;
    }, function(error) {
        const notifyFunc = Vue.prototype.$notify;
        const _tj = Vue.prototype.$tj;
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        const status = get(error, 'response.status', 0);
        const data = get(error, 'response.data', '');
        if (status === 404) {
            notifyFunc({
                content: _tj(JSON.stringify({
                    key: 'errors.NotFound',
                })),
                color: 'error',
            });
        } else if (status === 401) {
            removeItem('user');
            router.replace('/login');
        } else {
            notifyFunc({
                content: error,
                color: 'error',
            });
        }


        // if(status >= 500) {
        //     notifyFunc({
        //         content: _tj(JSON.stringify({
        //             key: 'errors.NotFound'
        //         })),
        //         color: 'error',
        //     });
        // }
        return Promise.reject(error);
    });
}
