var path = require('./gulp/config.js').path;

var gulp = require('gulp');
var webpack = require('webpack');
var argv = require('yargs').argv;

var webpackConfigPath = '';

if (argv.mobile) {
    webpackConfigPath = './webpack.config.mobile.js';
    path.base = path.mobile;
} else {
    webpackConfigPath = './webpack.config.js';
}

var webpackConfig = require(webpackConfigPath);

var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var notifier = require("node-notifier");

gulp.task('build:vendor', function() {
    gulp.src(path.base + '/vendor/*').pipe(gulp.dest('./web/js/vendor/'));
});

gulp.task('build:js', ['build:vendor'], function(callback) {

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

gulp.task('watch', function() {
    gulp.watch(
        [path.base + '/**/*'],
        ['build:js']
    );
});

gulp.task('default', runSequence('build:js', 'watch'));