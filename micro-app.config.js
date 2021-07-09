

const path = require('path');

module.exports = {
    version: '0.0.1',
    type: '', // types 类型
    entry: {
        index: [ './src/kubecube/index.js' ],
    },
    htmls: [{
        filename: 'index.html',
        title: 'Kubecube',
        hash: true,
        template: './src/template/index.html',
    }],
    staticPath: path.resolve(__dirname, 'src/client/static/'),
    alias: { // 前后端
        library: {
            link: path.resolve(__dirname, 'src/client/components/'),
            description: '公共依赖组件',
        },
        components: {
            link: path.resolve(__dirname, 'src/client/components/'),
            description: '公共依赖组件',
        },
        base: path.resolve(__dirname, 'src/client/base/'),
        mixins: path.resolve(__dirname, 'src/client/base/mixins/'),
        filters: path.resolve(__dirname, 'src/client/filters/'),
        directives: path.resolve(__dirname, 'src/client/directives/'),
        utils: path.resolve(__dirname, 'src/client/utils/'),
        assets: path.resolve(__dirname, 'src/client/assets/'),
        icons: path.resolve(__dirname, 'src/client/assets/icons/'),
        static: path.resolve(__dirname, 'src/client/static/'),
        views: path.resolve(__dirname, 'src/client/views/'),
        services: path.resolve(__dirname, 'src/client/services/'),

        kubecube: path.resolve(__dirname, 'src/kubecube/'),
        jchart: path.resolve(__dirname, 'src/JChart/'),
    },

    plugins: require('./plugins'),

    // 以下为开发测试功能
    devServer: {
        port: '4330',
    },
};
