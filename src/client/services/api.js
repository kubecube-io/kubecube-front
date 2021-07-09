const apis = {
    getApiList: {
        action: 'DescribeApiListByLimit',
    },
    // api状态列表
    getApiStatus: {
        action: 'DescribeApiDocument',
    },
    // 所属服务列表
    getApiServiceList: {
        action: 'DescribeServiceForApi',
    },
    // 发布API
    publishApi: {
        action: 'PublishApi',
        method: 'post',
    },
    // 通过Excel导入API
    importApi: {
        action: 'CreateApiByExcelFile',
        method: 'post',
    },
    // 批量发布API
    batchPublishApi: {
        action: 'PublishMultiApi',
        method: 'post',
    },
    // 新增API
    createApi: {
        method: 'post',
        action: 'CreateApi',
    },
    // 修改API
    updateApi: {
        method: 'post',
        action: 'UpdateApi',
    },
    // 删除API
    deleteApi: {
        action: 'DeleteApiById',
    },
    // api详情
    getApiDetail: {
        action: 'DescribeApiById',
    },
    // 获取API request query
    getApiReqQueryList: {
        action: 'DescribeQueryString',
    },
    // 获取API query type
    getApiQueryParamType: {
        action: 'DescribeQueryStringParamType',
    },
    // 获取API request header
    getApiReqHeaderList: {
        action: 'DescribeRequestHeader',
    },
    // 获取 request header 类型
    getReqHeaderType: {
        action: 'DescribeHeaderParamType',
    },
    // 获取 request body
    getApiReqBody: {
        action: 'DescribeRequestBody',
    },
    // 获取 request body param
    getBodyParam: {
        action: 'DescribeBodyParam',
    },
    // 保存 request body
    saveApiReqBody: {
        action: 'CreateRequestBody',
        method: 'post',
    },
    // 获取自定义模型
    getApiModel: {
        action: 'DescribeApiModel',
    },
    // 保存 request query
    saveQueryString: {
        action: 'CreateQueryString',
        method: 'post',
    },
    // 保存 request header
    saveRequestHeader: {
        action: 'CreateRequestHeader',
        method: 'post',
    },
    // 获取API response header
    getApiResHeaderList: {
        action: 'DescribeResponseHeader',
    },
    // 获取API response body
    getApiResBodyList: {
        action: 'DescribeResponseBody',
    },
    // 创建 response header
    saveResponseHeader: {
        action: 'CreateResponseHeader',
        method: 'post',
    },
    // 创建 response body
    saveResponseBody: {
        action: 'CreateResponseBody',
        method: 'post',
    },
    // 获取API response code
    getApiResCode: {
        action: 'DescribeStatusCode',
    },
    // 创建 response code
    saveResponseCode: {
        action: 'CreateStatusCode',
        method: 'post',
    },
    // 获取API示例
    getApiExample: {
        action: 'DescribeExample',
    },
    // 更新API示例
    saveApiExample: {
        action: 'CreateApiExample',
        method: 'post',
    },
    // API修改记录
    getApiLog: {
        action: 'DescribeOperationList',
    },
    // 以json形式上传body
    addResBodyByJson: {
        action: 'GenerateBodyByJson',
        method: 'post',
    },
    // webService类型服务 类列表
    webServiceClass: {
        action: 'GetWebServiceInterface',
    },
    // webService类型服务 类列表
    webServiceMethod: {
        action: 'GetWebServiceMethod',
    },
    // 获取webService类型参数
    webServiceParam: {
        action: 'DescribeWebserviceParam',
    },
    // 保存webService类型参数
    saveServiceParam: {
        action: 'CreateWebserviceParam',
        method: 'post',
    },
    // 获取dubbo信息
    getDubboParam: {
        action: 'DescribeDubboParam',
    },
    // 获取Markdown
    getMarkdown: {
        action: 'DescribeMarkdownApiById',
    },
    // 获取API可发布网关
    getApieGateway: {
        action: 'DescribeGatewayForPublishedApi',
    },
};

export default apis;
