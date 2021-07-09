
module.exports = function(rawArgv) {
    const { semver, error, matchesPluginId, isPlugin } = require('@vue/cli-shared-utils');
    const requiredVersion = require('@vue/cli-service/package.json').engines.node;

    if (!semver.satisfies(process.version, requiredVersion)) {
        error(
            `You are using Node ${process.version}, but vue-cli-service ` +
            `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
        );
        process.exit(1);
    }

    const Service = require('@vue/cli-service');
    const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd());

    // fixed
    const dependencies = require('../../package.json').dependencies || {};
    Object.keys(dependencies).filter(isPlugin).forEach(id => {
        if (!service.plugins.some(p => matchesPluginId(id, p.id))) {
            service.plugins.push({
                id, apply: require(id),
            });
        }
    });
    service.modes = service.plugins.reduce((modes, { apply: { defaultModes } }) => {
        return Object.assign(modes, defaultModes);
    }, {});

    const args = require('minimist')(rawArgv, {
        boolean: [
            // build
            'modern',
            'report',
            'report-json',
            'inline-vue',
            'watch',
            // serve
            'open',
            'copy',
            'https',
            // inspect
            'verbose',
        ],
    });
    const command = args._[0];
    return service.run(command, args, rawArgv).catch(err => {
        error(err);
        process.exit(1);
    });
};
