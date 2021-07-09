import request from './request.js';

const perfix = '/cicdDeploy/proxy';

export default{
    notify(param) {
        return request.post(perfix + '/api/v1/cicd-deploy/ncs-cluster/addNotify', param);
    },
    getLegacyDeploymentSwitch() {
        return request.get('/cicd/proxy/api/v1/cicd/deploy/legacyEnabled');
    },
};
