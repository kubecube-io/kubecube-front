
module.exports = {
    outputDir: 'public',
    publicPath: '/public/',
    filenameHashing: true,
    runtimeCompiler: true,
    lintOnSave: process.env.MICRO_APP_LINT_CONFG_SWITCH === 'close' ? false : process.env.NODE_ENV !== 'production', // 默认开启
    transpileDependencies: [
        '@micro-app', // all
    ],

};
