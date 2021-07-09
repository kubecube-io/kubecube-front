import axios from 'axios';
import { omit } from 'lodash';

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
        timeout: 10000
    });
    const requests = {};
    Object.keys(apis).forEach(key => {
        let preset = apis[key];
        let template = preset.template;
        if(template){
            template = resolveTemplate(template);
        }
        preset = omit(preset, 'template');
        requests[key] = async (requestBody = {}) => {
            if(requestBody.pathParams) {
                requestBody.url = template(requestBody.pathParams);
                requestBody = omit(requestBody, 'pathParams');
            }
            // console.log(preset, requestBody)
            return await axiosInstance.request({
                ...preset,
                ...requestBody
            });
        };
    });

    return {
        axiosInstance,
        ...requests,
    };
}
