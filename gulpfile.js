var path = require('./gulp/config.js').path;

var gulp = require('gulp');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var gutil = require('gulp-util');

gulp.task('build:js', function(callback) {

    function error(err, stats) {

        if(err) {
            throw new gutil.PluginError("build:js", err);
        }

        gutil.log("[build:js]", stats.toString({
            colors: true
        }));

        callback();
    }

    return webpack(webpackConfig).run(error);

});

gulp.task('watch', function() {
    gulp.watch(
        [path.base + '/**/*'],
        ['build:js']
    );
});

gulp.task('default', ['build:js']);