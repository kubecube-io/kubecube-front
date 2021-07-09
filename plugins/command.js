

// fix vue.config.js
process.env.VUE_CLI_SERVICE_CONFIG_PATH = require.resolve('../config/vue.config.js');

// fix vusion.config.js
process.env.VUSION_CONFIG_PATH = require.resolve('../config/vusion.config.js');

let globalVueConfig;

module.exports = function customCommand(api) {
    const { fs, path } = require('@micro-app/shared-utils');
    const devServerConfig = require('../config/webpack.dev-server.js');

    const mode = api.mode || 'development';

    // change vue.config.js
    api.modifyVueConfig(vueConfig => {
        const config = api.config || {};
        const micros = Object.keys(config.pages || {});
        if (mode === 'development') {
            vueConfig.devServer = devServerConfig(api, {
                modules: micros.map(key => {
                    return key.replace(/^@micro-app/ig, '');
                }),
            });
        }
        globalVueConfig = vueConfig;
        return vueConfig;
    });

    api.registerCommand('vue-cli-service', () => {
        const vueService = require('./lib/vue-cli-service');

        const argv = process.argv.slice(3);

        return vueService(argv);
    });

    // dev
    api.modifyCreateDevServer(() => {
        const vueService = require('./lib/vue-cli-service');

        // 开发模式先清除 public 文件
        const publicPath = path.resolve(api.root, 'public');
        if (fs.existsSync(publicPath)) {
            fs.removeSync(publicPath);
        }

        let argv = [];
        if (process.argv[2] === 'vue') {
            argv = process.argv.slice(3);
        } else {
            argv = process.argv.slice(2);
        }

        return function() {
            return vueService(argv).then(() => {
                let port = 8080;
                if (globalVueConfig && globalVueConfig.devServer) {
                    port = globalVueConfig.devServer.port;
                }
                api.logger.info('[Proxy URL]', '代理的开发地址可能如下：');
                api.logger.info('[Proxy URL]', `http://dev.console.qa-ci.service.163.org:${port}`);
            });
        };
    });

    // build
    api.modifyCreateBuildProcess(() => {
        const vueService = require('./lib/vue-cli-service');


        return function() {
            let argv = [];
            if (process.argv[2] === 'vue') {
                argv = process.argv.slice(3);
            } else {
                argv = process.argv.slice(2);
            }

            return vueService(argv).then(() => {
                if (!api.context.subModule) {
                // 输出当前 git 版本信息
                    let outputDir;
                    const webpackConfig = api.getState('webpackConfig');
                    if (webpackConfig) {
                        outputDir = webpackConfig.output.path;
                    }
                    if (!outputDir && globalVueConfig) {
                        outputDir = globalVueConfig.outputDir;
                    }
                    api.logger.info('[Build]', '主应用构建完成！');

                }
                api.logger.info('[Build]', '构建完成！');

            });
        };
    });
};
