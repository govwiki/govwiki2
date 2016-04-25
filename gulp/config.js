var argv = require('yargs').argv;
var path = require('path');

var frontendPath = path.resolve('./src/GovWiki/FrontendBundle/Resources/public');
var mobilePath = path.resolve('./src/GovWiki/MobileBundle/Resources/public');

var webpackDesktopPath = path.resolve('./webpack.config.js');
var webpackMobilePath = path.resolve('./webpack.config.mobile.js');

var config = {};

module.exports = {
    path: {
        base: argv.mobile ? mobilePath : frontendPath,
        webpack: argv.mobile ? webpackMobilePath : webpackDesktopPath,
    },
    config: config
};