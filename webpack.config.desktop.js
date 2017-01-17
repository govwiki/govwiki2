'use strict';

var pathUtil = require('path');
var webpack = require('webpack');

var path = {
    base: 'src/GovWiki/FrontendBundle/Resources/public/js',
    web: '/web/js'
};

module.exports = {
    cache: false,
    entry: {
        map: './' + path.base + '/home/index.js',
        government: './' + path.base + '/government/index.js',
        common: './' + path.base + '/common.js',
        elected: './' + path.base + '/elected/handlers.js'
    },
    output: {
        path: __dirname + path.web,
        filename: '[name].js',
        chunkFilename: '[id].js'
    },
    devtool: 'eval',
    resolve: {
        root: [ pathUtil.join(__dirname, 'bower_components') ],
        alias: {
            typeahead: pathUtil.join(__dirname, path.base, '/vendor/typeahead.js'),
            handlebars: pathUtil.join(__dirname, path.base, '/vendor/handlebars.js')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['common'],
            filename: 'common.js'
        }),
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
        )
    ]
};
