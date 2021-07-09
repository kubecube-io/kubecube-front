const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
module.exports = function(api, opts) {
    const __DEV__ = api.mode === 'development';
    const root = api.root; // 主容器根目录

    // 修改通用 webpack 配置, 此修改会对所有模块进行使用.
    api.modifyChainWebpackConfig(webpackChainConfig => {
    //     add(webpackChainConfig, 'dll', Object.assign({}, opts, { root }));
        add(webpackChainConfig, 'ui', Object.assign({}, opts, { root }));
        // 锁死路径
        webpackChainConfig.resolve.alias
            .set('@necfe/cloud-ui-internal', path.resolve(__dirname, '../lib/cloud-ui-internal'))
            .set('vue$', require.resolve('vue/dist/vue.esm.js'))
            .set('vue-router$', require.resolve('vue-router/dist/vue-router.esm.js'))
            .set('vuex$', require.resolve('vuex/dist/vuex.esm.js'))
            .set('kubecube', path.resolve(__dirname, '../src/kubecube'))
            .set('jchart', path.resolve(__dirname, '../src/JChart'));

        webpackChainConfig
            .context(root)
            .output
            .filename(__DEV__ ? '[name].js' : '[name].[hash].js')
            .end();

        webpackChainConfig.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions.preserveWhitespace = false; // 兼容之前版本
                return options;
            });
        webpackChainConfig.plugin('monaco-webpack-plugin').use(MonacoWebpackPlugin, [{
            languages: [ 'yaml', 'shell' ],
            filename: 'monaco-editor',
        }]);
        webpackChainConfig.plugin('html-index').tap(
            args => ([{
                ...args[0],
                template: path.resolve(__dirname, '../template/kubecube.html'),
                favicon: path.resolve(__dirname, '../src/kubecube/component/global/icon/logo.png'),
            }]));
        // webpackChainConfig.plugin('bundle-analyzer').use(BundleAnalyzerPlugin);
        return webpackChainConfig; // 一定要返回
    });
};
function add(config, fnName, options) {
    const configFn = require(`../config/webpack-${fnName}.js`);
    if (configFn instanceof Function) { configFn(config, options); }
}
