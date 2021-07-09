
const path = require('path');

// register plugins

module.exports = [
    '@micro-app/vue-cli-plugin-microapp',
    [ '@micro-app/plugin-compatible', { server: true }], // 适配 v1
    [ // 0
        {
            id: 'common:plugins-custom-command',
            link: path.resolve(__dirname, './command.js'),
            description: '公共通用 common 提供自定义 command',
        },
    ],
    [ // 1
        {
            id: 'common:plugins-enhance-webpack',
            link: path.resolve(__dirname, './enhance-webpack.js'),
            description: '公共通用 common 提供增强 webpack 配置',
        },
    ],
];
