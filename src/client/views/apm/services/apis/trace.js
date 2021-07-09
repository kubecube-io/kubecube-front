const prefix = '/apm/redirect/api';
export default {
    getZipkinTrace: {
        path: `${prefix}/traces`,
        method: 'get',
    },
    getServices: {
        path: `${prefix}/services`,
        method: 'get',
    },
    getOperations: {
        path: `${prefix}/operations`,
        method: 'get',
    },
    getMetrics: {
        path: `${prefix}/metrics`,
        method: 'get',
    },
    getHistograms: {
        path: `${prefix}/histograms`,
        method: 'get',
    },
    getInfoByTrace: {
        path: `${prefix}/internal/traces`,
        method: 'get',
    },
    getTraceLog: {
        path: `${prefix}/logs`,
        method: 'get',
    },
    getRelyService: {
        path: `${prefix}/dependencies`,
        method: 'get',
    },
};
