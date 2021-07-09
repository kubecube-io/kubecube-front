import Vue from 'vue';
import { removeItem } from 'kubecube/utils/persistant';
import router from 'kubecube/router';
import { get } from 'lodash';

export function userInterceptor(instance, errHandler) {

    instance.interceptors.response.use(function(response) {
        // const { code, message } = error.response.data;
        // console.log(response)
        const { status, headers } = response;
        if (status === 200) {
            if (headers['content-length'] !== 0 && headers['content-type'] && headers['content-type'].startsWith('application/json')) {
                return response.data;
            }
            return response;
        }
        return response;
    }, function(error) {
        const notifyFunc = Vue.prototype.$toast;
        const status = get(error, 'response.status', 0);
        const data = get(error, 'response.data', '');
        console.log(error.request, data, instance, this);
        if (errHandler && errHandler(data)) {
            return;
        }

        if (status === 404) {
            notifyFunc.error('网络或浏览器出现问题，请稍后再试');
        } else if (status === 401) {
            removeItem('user');
            if (!router.currentRoute.meta.noCredential) {
                router.replace('/login');
            }

        } else if (status === 403) {
            notifyFunc.error('您没有权限！请联系管理员添加！');
            // router.replace('/noauth');
        } else {
            // console.log(error)
            notifyFunc.error(error);
            // notifyFunc({
            //     content: error,
            //     color: 'error',
            // });
        }


        // if(status >= 500) {
        //     notifyFunc({
        //         content: _tj(JSON.stringify({
        //             key: 'errors.NotFound'
        //         })),
        //         color: 'error',
        //     });
        // }
        return Promise.reject(data || error);
    });
}
