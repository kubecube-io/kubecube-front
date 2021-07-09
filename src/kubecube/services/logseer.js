import Service from './service';

import { userInterceptor } from './interceptor';
const logseerService = Service({
    baseURL: '/api/v1/logseer/extends',
    apis: {
        labelSelectorKeys: {
            method: 'get',
            url: '/labelSelectorKey',
        },
        elasticSearch: {
            method: 'post',
            url: '/elasticsearch/_search',
        },
        availableFields: {
            method: 'get',
            url: '/elasticsearch/availableFields',
        },
        suggestions: {
            method: 'post',
            url: '/elasticsearch/suggestions',
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
            url: '/elasticsearch/query',
        },
    },
});

userInterceptor(logseerService.axiosInstance);

export default logseerService;
