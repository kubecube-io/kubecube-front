import axios from 'axios';
import { omit, cloneDeep } from 'lodash';
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
        requests[key] = async (requestBody = {}) => {
            let payload = cloneDeep(requestBody);
            if (requestBody.pathParams) {
                payload.url = template(requestBody.pathParams);
                payload = omit(payload, 'pathParams');
            }
            // console.log(preset, requestBody)
            if (requestBody.silent) {
                axiosInstance[`request-${key}`] = {
                    silent: true,
                };
                payload = omit(payload, 'silent');
            }
            return await axiosInstance.request({
                ...preset,
                ...payload,
            });
        };
    });

    return {
        axiosInstance,
        ...requests,
    };
}
