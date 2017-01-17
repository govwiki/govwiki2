var argv = require('yargs').argv;
var path = require('path');

var frontendPath = path.resolve('./src/GovWiki/FrontendBundle/Resources/public');
var mobilePath = path.resolve('./src/GovWiki/MobileBundle/Resources/public');

var webpackDesktopPath = path.resolve(
  argv.prod
    ? './webpack.config.desktop.prod.js'
    : './webpack.config.desktop.js'
);
var webpackMobilePath = path.resolve(
  argv.prod
    ? './webpack.config.mobile.prod.js'
    : './webpack.config.mobile.js'
);

var config = {};

module.exports = {
    path: {
        base: argv.mobile ? mobilePath : frontendPath,
        webpack: argv.mobile ? webpackMobilePath : webpackDesktopPath,
    },
    config: config
};