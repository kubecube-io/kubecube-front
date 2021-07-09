/**
 * common dll 部分dll文件由webpack.dll.config.js生成，包括了vue，vue-router, lodash, core-js
 */

const path = require('path');

module.exports = config => {
    config.resolve.alias
        .set('cloud-ui.vusion$', path.resolve(__dirname, '../ui/cobalt/cloud-ui.js'))
        .set('cloud-ui.vusion/cloud-ui.css$', path.resolve(__dirname, '../ui/cobalt/cloud-ui.css'))
        // .set('cloud-ui.vusion$', require.resolve('cloud-ui.vusion/dist/index.js'))
        // .set('cloud-ui.vusion/cloud-ui.css$', require.resolve('cloud-ui.vusion/dist/theme-cobalt.css'))

        .set('@necfe/cloud-ui-internal', path.resolve(__dirname, '../lib/cloud-ui-internal'));
    return config;
};
