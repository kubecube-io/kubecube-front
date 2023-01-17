import Service from './service';

import { userInterceptor } from './interceptor';
const v1Profix = '/api/v1/logseer/extends';
const v2Profix = '/api/v2/logseer/extends';
const logseerService = Service({
    baseURL: '',
    apis: {
        getLogconfigList: {
            method: 'get',
            template: `${v2Profix}/logconfigs`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        createLogconfig: {
            method: 'post',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        getLogconfigInstance: {
            method: 'get',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs/{name}`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        updateLogconfig: {
            method: 'put',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs/{name}`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        deleteLogconfig: {
            method: 'delete',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs/{name}`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },


        labelSelectorKeys: {
            method: 'get',
            url: `${v1Profix}/labelSelectorKey`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        elasticSearch: {
            method: 'post',
            url: `${v1Profix}/elasticsearch/_search`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        availableFields: {
            method: 'get',
            url: `${v1Profix}/elasticsearch/availableFields`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        suggestions: {
            method: 'post',
            url: `${v1Profix}/elasticsearch/suggestions`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        /**
        size：number，非必填，默认5，表示查询返回的条数

        search_after：timestamp，从哪个时间戳开始返回

        sort：排序

        timestamp：必填，string，可为asc或者desc，按照时间戳排序
        range：查询范围

        timestamp：时间范围

        gte：number，大于等于某个时间点，unix时间戳，毫秒
        lte：number，小于等于某个时间点，unix时间戳，毫秒
        如果为上翻页，为锚日志时间戳到后一天相同时间的时间戳；如果为下翻页，为锚日志时间戳到前一天相同时间的时间戳
    */
        elasticContext: {
            method: 'post',
            url: `${v1Profix}/elasticsearch/query`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
    },
});

userInterceptor(logseerService.axiosInstance);

export default logseerService;
