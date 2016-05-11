var gulp = require('gulp');
var gutil = require('gulp-util');
var notifier = require("node-notifier");
var path = require('./config.js').path;

var webpack = require('webpack');
var webpackConfig = require(path.webpack);

gulp.task('build:vendor', function() {
    gulp.src(path.base + '/js/vendor/*').pipe(gulp.dest('./web/js/vendor/'));
});

gulp.task('build:js', ['build:vendor'], function(callback) {

    gulp.start('check-install');

    function error(err, stats) {

        if(err) {
            throw new gutil.PluginError("build:js", err);
        }

        gutil.log("[build:js]", stats.toString({
            colors: true
        }));

        notifier.notify({ title: 'Build finished', message: 'with webpack...'});

        callback();
    }

    return webpack(webpackConfig).run(error);

});

gulp.task('build', ['build:js']);