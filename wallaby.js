var wallabyWebpack = require('wallaby-webpack');
var webpackConfig = require('./webpack.config.js');
var webpackPostprocessor = wallabyWebpack(webpackConfig);

module.exports = function () {
    return {
        files: [
            {pattern: 'src/GovWiki/FrontendBundle/Resources/public/js/**/*.js', load: false}
        ],
        tests: [
            { pattern:'tests/frontend/unit/**/*.js', load: false }
        ],
        testFramework: 'mocha',
        postprocessor: webpackPostprocessor,

        setup: function () {
            // required to trigger test loading
            window.__moduleBundler.loadTests();
        }
    };
};