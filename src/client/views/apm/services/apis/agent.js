import { prefixV1 } from '../base.js';
export default {
    getJavaAgentConfig: {
        path: prefixV1 + '/userGuide/javaAgentConfig',
        method: 'get',
    },
    getJavaAgentInstallation: {
        path: prefixV1 + '/userGuide/javaAgentInstallation',
        method: 'get',
    },
}