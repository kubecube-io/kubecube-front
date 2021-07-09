import Service from '@micro-app/common/services/service.js';

const licenseApis = {
    status: {
        method: 'get',
        path: '/status',
    },
};

const service = new Service(licenseApis, '/inner/api/v1/license');

export default service;
