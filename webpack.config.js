'use strict';

var webpack = require("webpack");

var base = './src/GovWiki/FrontendBundle/Resources/public/js';

/**
 * Entry points
 */
var entry = {};
entry[base + "/home/index"] = base + "/home/index.js";
entry[base + "/government/index"] = base + "/government/index.js";


module.exports = {
    output: {
        filename: "[name].bundle.js",
        chunkFilename: "[id].bundle.js"
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.NoErrorsPlugin(),
        //new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            filename: base + "/common.js"
        })
    ]
};

module.exports.entry = entry;                                                                                                                                                                                                                                                                                                                                                                                                                                   
