const prefix = '/apm/redirect/api/v2/products/{tenantId}/{productId}';
export default {
    getEvent: {
        path: prefix + '/getEvent',
        method: 'get',
    },
}