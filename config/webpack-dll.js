/**
 * common dll 部分dll文件由webpack.dll.config.js生成，包括了vue，vue-router, lodash, core-js
 */
const path = require('path');
const webpack = require('webpack');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = (config, { root }) => {
    const __DEV__ = process.env.NODE_ENV === 'development';
    config
        .plugin('dll-refer')
        .use(webpack.DllReferencePlugin, [{
            context: root,
            manifest: __DEV__ ? require('../dll/vendorDll.dev.manifest.json') : require('../dll/vendorDll.manifest.json'),
            // manifest: require('../dll/vendorDll.manifest.json'),
        }])
        .end()
        .plugin('dll-insert')
        .use(AddAssetHtmlPlugin, [{
            // 暂时隐藏警告，把业务类型的错误处理的差不多的时候，再放开
            filepath: __DEV__ ? path.resolve(__dirname, '../dll/vendorDll-dev.js') : path.resolve(__dirname, '../dll/vendorDll.*.js'),
            // filepath: path.resolve(__dirname, '../dll/vendorDll.*.js'),
        }])
        .end();
    return config;
};
