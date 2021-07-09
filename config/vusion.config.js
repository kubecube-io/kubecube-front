const path = require('path');

module.exports = {
    name: process.env.SUB_MODULES_ICON_FONT_NAME,
    type: 'app',
    libraryPath: path.resolve(__dirname, '../src/client/components/'),
    staticPath: 'src/client/static/',
    docs: false,
    overwrite: false,
};

