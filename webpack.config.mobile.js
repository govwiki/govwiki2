'use strict';

var pathUtil = require('path');
var webpack = require('webpack');

var path = {
    base: 'src/GovWiki/MobileBundle/Resources/public/js',
    web: './web/js'
};

module.exports = {
    cache: false,
    entry: {
        map: './' + path.base + '/home/index.js',
        government: './' + path.base + '/government/index.js',
        common: './' + path.base + '/common.js'
    },
    output: {
        path: __dirname + '/web/js',
        filename: '[name].js',
        chunkFilename: '[id].js'
    },
    devtool: 'eval',
    resolve: {
        root: [pathUtil.join(__dirname, 'bower_components')],
        alias: {
            handlebars: pathUtil.join(__dirname, path.base, '/vendor/handlebars.js')
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                // This has effect on the react lib size
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.NoErrorsPlugin(),
        //new webpack.optimize.UglifyJsPlugin({
        //    compress: {
        //        warnings: false
        //    }
        //}),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['common'],
            filename: 'common.js'
        }),
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
        )
    ]
};
