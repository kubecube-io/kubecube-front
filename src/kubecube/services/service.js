import axios from 'axios';
import Vue from 'vue';
import { omit, cloneDeep, get } from 'lodash';
import { removeItem } from 'kubecube/utils/persistant';
import router from 'kubecube/router';
import { setItem } from 'kubecube/utils/persistant';

// import Cookies from 'js-cookie';

const resolveTemplate = template => {
    const r = template.split(/\{([^}]*)\}/).filter(p => p);
    return obj => {
        if (r.length === 1) return template;

        return r.reduce((str, part) => {
            if (!part.includes('/') && !obj[part]) {
                throw new Error(`${template}: ${part} is missiing!`);
            }
            if (obj[part]) str += obj[part];
            else str += part;
            return str;
        }, '');
    };
};

export default function Service({
    baseURL,
    apis = {},
}) {
    const axiosInstance = axios.create({
        baseURL,
        timeout: 10000,
        // decompress: true,
    });
    const requests = {};
    Object.keys(apis).forEach(key => {
        let preset = apis[key];
        let template = preset.template;
        if (template) {
            template = resolveTemplate(template);
        }
        preset = omit(preset, 'template');
        const presetSilent = preset.silent;
        preset = omit(preset, 'silent');
        requests[key] = async (requestBody = {}) => {
            let payload = cloneDeep(requestBody);
            let silent = false;
            if (requestBody.pathParams) {
                payload.url = template(requestBody.pathParams);
                payload = omit(payload, 'pathParams');
            }
            // console.log(preset, requestBody)
            if (presetSilent || requestBody.silent) {
                silent = true;
                payload = omit(payload, 'silent');
            }
            return await axiosInstance.request({
                ...preset,
                ...payload,
            }).catch(error => {
                if (!silent) {
                    const notifyFunc = Vue.prototype.$toast;
                    const status = get(error, 'response.status', 0);
                    const data = get(error, 'response.data', '');
                    if (status === 404) {
                        notifyFunc.error('网络或浏览器出现问题，请稍后再试');
                    } else if (status === 401) {
                        removeItem('user');
                        if (!router.currentRoute.meta.noCredential) {
                            setItem('lastlocation', JSON.stringify({
                                path: router.currentRoute.path,
                                query: router.currentRoute.query,
                            }));
                            router.replace('/login');
                        }

                    } else if (status === 403) {
                        notifyFunc.error('您没有权限！请联系管理员添加！');
                        // router.replace('/noauth');
                    } else {
                        // console.log(error)
                        notifyFunc.error((data && data.message) || error);
                        // notifyFunc({
                        //     content: error,
                        //     color: 'error',
                        // });
                    }
                    throw data || error;
                }
            });
        };
    });

    return {
        axiosInstance,
        ...requests,
    };
}
