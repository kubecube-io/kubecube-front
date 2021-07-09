module.exports = function() {
    return {
        compress: true,
        hot: true,
        // https: true,
        // stats: 'errors-only',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers':
                'X-Requested-With, content-type, Authorization',
        },
        proxy: {
            '/api/v1/cube': {
                target: 'https://10.173.32.42:30443',
                secure: false,
                changeOrigin: true,
            },
            '/api/v1/logseer': {
                target: 'http://10.173.32.42:32147',
            },
            '/api/v1/label': {
                target: 'http://10.173.32.42:31090',
            },
            '/api/v1/series': {
                target: 'http://10.173.32.42:31090',
            },
            '/api/v1/query': {
                target: 'http://10.173.32.42:31090',
            },
            '/api/v1/query_range': {
                target: 'http://10.173.32.42:31090',
            },
            '/api/v1/webconsole': {
                target: 'http://10.173.32.42:30010',
                pathRewrite: { '^/api/v1/webconsole': '/api/v1' },
            },
            '/webconsole/api/sockjs': {
                target: 'http://10.173.32.42:30010',
                pathRewrite: { '^/webconsole/api/sockjs': '/api/sockjs' },
            },
            '/api/v1/audit': {
                target: 'http://10.173.32.42:30008',
                pathRewrite: { '^/api/v1/audit': '/api/v1/cube/audit' },
            },
            // 10.173.32.42:30010/api/v1/pivot-cluster/pod/es/es-0/shell/wb-test-nginx
        },
    };
};
